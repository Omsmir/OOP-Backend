import {
    FRONTEND_URL,
    PROJECT_NAME,
    REDIS_DEV_URI,
    REDIS_PWD,
    VERIFICATION_TOKEN_TTL,
} from '@/config/defaults';
import { Queue, Worker } from 'bullmq';
import IoRedis, { Redis } from 'ioredis';
import { logger } from '@/utils/logger';
import { CACHE_TTL, REDIS_CACHE_KEYS, RedisServices } from '@/utils/redis';
import UserRepository from '@/repository/auth.repo';
import { EMAIL_SERVICES } from '@/utils/mail-service';
import { EMAIL_TEMPLATES, SUBJECT_TYPES } from '@/interfaces/global.interface';
import { signJwt } from '@/utils/jwt.sign';
import { HASHING_ALGORITHMS, JWT_SECRET_KEYS } from '@/interfaces/permissions';

export type CreateWorkerProps = {
    name: string;
    data?: any;
    connection: Redis;
};

export type WORKER_RESULT = {
    type: WORKERS_RESULT_TYPES;
    userId?: string;
};

export enum WORKERS_RESULT_TYPES {
    EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
}

export enum WORKER_TYPES {
    EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
    UPLOAD = 'UPLOAD',
}

class BullWorkers {
    private static redisConnection: Redis;
    private queues: Map<string, Queue> = new Map();

    constructor() {
        if (!BullWorkers.redisConnection) {
            BullWorkers.redisConnection = new IoRedis(REDIS_DEV_URI as string, {
                maxRetriesPerRequest: null,
                password: REDIS_PWD,
            });
            this.attachConnectionListeners(BullWorkers.redisConnection);
        }
    }

    private attachConnectionListeners(connection: Redis) {
        connection.on('connect', () => logger.info(' BullMQ connected to Redis'));
        connection.on('error', (err) => logger.error(' BullMQ Redis connection error', err));
    }

    /**
     * Get or create a BullMQ queue
     */
    public getQueue(queueName: string): Queue {
        if (!this.queues.has(queueName)) {
            const queue = new Queue(queueName, { connection: BullWorkers.redisConnection });
            this.queues.set(queueName, queue);
        }
        return this.queues.get(queueName)!;
    }

    /**
     * Create a BullMQ worker for a queue
     */
    public createWorker(queueName: string, processor: (job: any) => Promise<any>) {
        const worker = new Worker(queueName, processor, {
            connection: BullWorkers.redisConnection,
        });

        worker.on('completed', (job: any, result: WORKER_RESULT) => {
            const { type, userId } = result;
            switch (type) {
                case WORKERS_RESULT_TYPES.EMAIL_VERIFICATION:
                    logger.info('email verification worker performed an event successfully');
                    break;
                default:
                    logger.error('invalid or unknown bull result type');
                    break;
            }

            // should be refactored to be more specific for single resposibility
            logger.info(
                ` Job ${job.id} on queue "${queueName}" completed. Result: ${JSON.stringify(result)}`
            );
        });

        worker.on('failed', (job, err, result) => {
            logger.error(` Job ${job?.id} on queue "${queueName}" failed: ${err.message}`);
        });

        return worker;
    }

    /**
     * Access raw Redis connection if needed
     */
    public getConnection(): Redis {
        return BullWorkers.redisConnection;
    }
}

export class Workers {
    constructor(
        private readonly bullWorkers: BullWorkers,
        private readonly userService: UserRepository,
        private readonly redisService: RedisServices
    ) {
        this.listen();
    }

    // need refactoring
    private listen() {
        logger.info('workers connected');
    }

    public worker_initiatition = () => {
        this.sendMailsWorker();
    };

    private sendMailsWorker = () => {
        this.bullWorkers.createWorker(WORKER_TYPES.EMAIL_VERIFICATION, async (job) => {
            try {
                const { email } = job.data;

                const user = await this.userService.findUserByEmail(email);

                if (!user) {
                    throw new Error('User is not found');
                }

                const send_email = (email: string, link: string) => {
                    return new EMAIL_SERVICES({
                        to: email,
                        appName: String(PROJECT_NAME),
                        templateName: EMAIL_TEMPLATES.EMAIL_VERIFICATION,
                        link,
                        year: new Date().toLocaleString(),
                        subject: SUBJECT_TYPES.EMAIL_VERIFICATION,
                    });
                };

                const EXISTED_TOKEN = await this.redisService.checkHash({
                    redis_cache_key: REDIS_CACHE_KEYS.EMAIL_VERIFICATION,
                    hash_name: `${user.id}`,
                    value: JWT_SECRET_KEYS.VERIFICATION_TOKEN,
                });

                if (EXISTED_TOKEN) {
                    const link = `${FRONTEND_URL}/dashboard/verify/${EXISTED_TOKEN}`;

                    send_email(email, link).execute();
                }
                const VERIFICATION_TOKEN = await signJwt(
                    { id: user.id, email },
                    JWT_SECRET_KEYS.VERIFICATION_TOKEN,
                    HASHING_ALGORITHMS.HS512,
                    { expiresIn: parseInt(VERIFICATION_TOKEN_TTL as string) * 24 }
                );

                const link = `${FRONTEND_URL}/dashboard/verify/${VERIFICATION_TOKEN}`; // example

                send_email(email, link).execute();

                await this.redisService.createHash({
                    redis_cache_key: REDIS_CACHE_KEYS.EMAIL_VERIFICATION,
                    hash_name: `${user.id}`,
                    expire: CACHE_TTL.ONE_DAY,
                    content: { VERIFICATION_TOKEN },
                });

                return { type: WORKERS_RESULT_TYPES.EMAIL_VERIFICATION, sucess: true };
            } catch (error: any) {
                throw new Error(error.message);
            }
        });
    };
}

export default BullWorkers;
