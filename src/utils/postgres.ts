import {
    NODE_ENV,
    POSTGRES_DB,
    POSTGRES_HOST,
    POSTGRES_PORT,
    POSTGRES_PWD,
    POSTGRES_SSL,
    POSTGRES_USER,
} from '@/config/defaults';
import { PostgresInterface } from '@/interfaces/global.interface';
import { Pool, QueryConfig, QueryConfigValues, QueryResult, QueryResultRow } from 'pg';
import { logger } from './logger';
import { allowDisallowPostgresSsl } from '@/database/utils';

class PostgresConnection implements PostgresInterface {
    private static instance: PostgresConnection;
    private readonly pool: Pool;
    constructor() {
        this.initializePostgres();

        this.pool = new Pool({
            host: POSTGRES_HOST,
            port: Number(POSTGRES_PORT) || 5432,
            database: POSTGRES_DB,
            password: POSTGRES_PWD,
            user: POSTGRES_USER,
            idleTimeoutMillis: 30000,
            ssl: allowDisallowPostgresSsl({ POSTGRES_SSL: String(POSTGRES_SSL) }).ssl,
        });
    }

    public static getInstance = (): PostgresConnection => {
        if (!PostgresConnection.instance) {
            PostgresConnection.instance = new PostgresConnection();
        }

        return PostgresConnection.instance;
    };

    public async query<R extends QueryResultRow, I = unknown[]>(
        queryTextOrConfig: string | QueryConfig<I>,
        values?: QueryConfigValues<I>
    ): Promise<QueryResult<R>> {
        return this.pool.query(queryTextOrConfig, values);
    }

    public async getClient() {
        return this.pool.connect();
    }

    private initializeDatabaseIfNotExists = async () => {
        try {
            const adminPool = new Pool({
                host: POSTGRES_HOST,
                port: Number(POSTGRES_PORT),
                user: POSTGRES_USER,
                password: POSTGRES_PWD,
                database: 'postgres',
                ssl: allowDisallowPostgresSsl({ POSTGRES_SSL: String(POSTGRES_SSL) }).ssl,
            });

            const checkQuery = `
        SELECT 1 FROM pg_database WHERE datname = $1;
      `;
            const checkResult = await adminPool.query(checkQuery, [POSTGRES_DB]);

            if (checkResult.rowCount === 0) {
                await adminPool.query(`CREATE DATABASE "${POSTGRES_DB}"`);
                logger.info(`🆕 Database "${POSTGRES_DB}" created successfully.`);
            } else {
                logger.info(`✅ Database "${POSTGRES_DB}" already exists.`);
            }

            await adminPool.end();
        } catch (error: any) {
            ``;
            throw new Error(error.message);
        }
    };

    private initializePostgres = async () => {
        try {
            if (NODE_ENV === 'test') return; // Skip in test environment
            
            await this.initializeDatabaseIfNotExists();
            const client = this.getClient();

            const res = (await client).query(`SELECT NOW()`);
            (await client).release();

            logger.info(`connected to postgres:${POSTGRES_DB} ${(await res).rows[0].now}`);
        } catch (error: any) {
            console.log('from postgres connection');
            logger.error(`${error.message}`);
        }
    };
}

export default PostgresConnection;
