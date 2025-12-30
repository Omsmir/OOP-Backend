import { migrate } from './setup';
import { Client } from 'pg';
import {
    POSTGRES_DB,
    POSTGRES_HOST,
    POSTGRES_PORT,
    POSTGRES_PWD,
    POSTGRES_SSL,
    POSTGRES_USER,
} from '@/config/defaults';
import { logger } from '@/utils/logger';
import { allowDisallowPostgresSsl } from './utils';

export class RunMigrations {
    private readonly client: Client;
    private static instance: RunMigrations;
    constructor() {
        this.client = new Client({
            host: POSTGRES_HOST,
            port: Number(POSTGRES_PORT) || 5432,
            database: POSTGRES_DB,
            password: POSTGRES_PWD,
            user: POSTGRES_USER,
            ssl: allowDisallowPostgresSsl({ POSTGRES_SSL: String(POSTGRES_SSL) }).ssl,
        });
    }
    public static getInstance = (): RunMigrations => {
        if (!RunMigrations.instance) {
            RunMigrations.instance = new RunMigrations();
        }
        return RunMigrations.instance;
    };

    public main = async () => {
        try {
            await this.client.connect();
            logger.info('running migrations started');

            await this.client.query('BEGIN');
            await migrate(this.client);

            await this.client.query('COMMIT');

            logger.info('PostgreSQL migrations completed successfully.');
        } catch (error: any) {
            await this.client.query('ROLLBACK').catch(() => {}); // safety
            throw new Error(
                `error occurred during connecting a client to postgres: ${error.message}`
            );
        } finally {
            await this.client.end();
        }
    };
}
