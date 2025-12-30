import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { Client } from 'pg';
import bcryptjs from 'bcryptjs';
import { migrate } from '../database/setup';

let postgresContainer: StartedPostgreSqlContainer;
let connectionString: string;

export default async function globalSetup() {
    // Start the postgres container once for all tests
    postgresContainer = await new PostgreSqlContainer('pgvector/pgvector:pg15').start();
    connectionString = postgresContainer.getConnectionUri();

    // Store connection string in global for other test files
    (globalThis as Record<string, unknown>).__POSTGRES_URI__ = connectionString;
    (globalThis as Record<string, unknown>).__POSTGRES_CONTAINER__ = postgresContainer;

    // Run migrations once
    const client = new Client({ connectionString });
    await client.connect();
    await migrate(client);

    // Insert default admin user with hashed password
    const salt = await bcryptjs.genSalt(10);

    const hashedPassword = await bcryptjs.hash('password', salt);

    const query = `INSERT INTO users (name, email, age,gender,role,permissions,password) VALUES ('omar','admin@example.com', 25, 'male', 'admin',  ARRAY['read', 'write', 'delete'], $1)`;

    await client.query(query, [hashedPassword]);

    await client.end();

    console.log('Global test setup complete - PostgreSQL container started');
}
