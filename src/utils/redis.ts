import { createClient, RedisClientType } from 'redis';
import { logger } from './logger';
import { REDIS_DATABASE, REDIS_DEV_URI, REDIS_PWD } from '@/config/defaults';

interface CreateHashProps {
    redis_cache_key: REDIS_CACHE_KEYS;
    hash_name: string;
    content: any;
    expire?: CACHE_TTL;
}

type hash_props = {
    redis_cache_key: REDIS_CACHE_KEYS;
    hash_name: string;
    value: string;
};

export enum REDIS_CACHE_KEYS {
    PERMISSIONS_KEY = 'RBAC:PERMISSIONS',
    USERS_KEY = 'USERS:DATA',
}

export enum CACHE_TTL {
    THIRTY_SECONDS = 30,
    ONE_MINUTE = 60,
    FIVE_MINUTES = 300,
    TEN_MINUTES = 600,
    THIRTY_MINUTES = 1800,
    ONE_HOUR = 3600,
    SIX_HOURS = 21600,
    TWELVE_HOURS = 43200,
    ONE_DAY = 86400,
    SEVEN_DAYS = 604800,
}
export class RedisConnection {
    private static instance: RedisConnection;
    private redisClient: RedisClientType;

    constructor() {
        this.redisClient = createClient({
            url: REDIS_DEV_URI,
            password: REDIS_PWD,
        });
        this.initializeConnection();
    }

    public static getInstance(): RedisConnection {
        if (!RedisConnection.instance) {
            RedisConnection.instance = new RedisConnection();
        }
        return RedisConnection.instance;
    }

    private initializeConnection = async () => {
        try {
            this.redisClient.on('connect', () =>
                logger.info(`connected to redis: ${REDIS_DATABASE}`)
            );

            this.redisClient.on('error', (err) => logger.error('error connecting to redis', err));

            await this.redisClient.connect();
        } catch (error: any) {
            logger.error('Error connecting to Redis:', error.message);
            throw new Error('Could not connect to Redis');
        }
    };

    public getClient(): RedisClientType {
        return this.redisClient;
    }

    public static async disconnect() {
        if (RedisConnection.instance) {
            await RedisConnection.instance.redisClient.quit();
        }
    }
}

export class RedisServices {
    constructor(private readonly redisClient: RedisClientType) {}

    public createHash = async ({
        redis_cache_key,
        hash_name,
        content,
        expire,
    }: CreateHashProps) => {
        await this.redisClient.hSet(`${redis_cache_key}:${hash_name}`, content);

        if (expire) {
            await this.redisClient.expire(`${redis_cache_key}:${hash_name}`, expire);
        }
    };
    public checkHash = async ({ redis_cache_key, hash_name, value }: hash_props) => {
        return await this.redisClient.hGet(`${redis_cache_key}:${hash_name}`, value);
    };

    public GetHashExpiration = async ({ redis_cache_key, hash_name }: Partial<hash_props>) => {
        return await this.redisClient.ttl(`${redis_cache_key}:${hash_name}`);
    };

    public DelHash = async ({ redis_cache_key, hash_name, value }: hash_props) => {
        return await this.redisClient.hDel(`${redis_cache_key}:${hash_name}`, value);
    };
}
