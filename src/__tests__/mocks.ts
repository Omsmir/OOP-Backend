import { PostgresInterface } from '@/interfaces/global.interface';
import { Client, PoolClient } from 'pg';

export const createMockDatabaseService = (client: Client): PostgresInterface => {
    return {
        query: client.query.bind(client),
        getClient: async () =>
            ({
                ...client,
                query: client.query.bind(client),
                release: () => {},
            }) as unknown as PoolClient,
    };
};

