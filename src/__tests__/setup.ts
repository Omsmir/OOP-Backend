import App from '@/app';
import { Client } from 'pg';
import request from 'supertest';
// postgres related funcs

const getInitialDb = async (client: Client) => {
    const admin_user = await client.query('SELECT * FROM users WHERE role = $1', ['admin']);

    if (!admin_user.rows.length) {
        throw new Error('Admin user not found in the database during test setup.');
    }

    return {
        admin: admin_user.rows[0],
    };
};

export const prepareDatabase = async () => {
    // Use the shared PostgreSQL container from global setup
    const connectionString = (globalThis as Record<string, unknown>).__POSTGRES_URI__ as string;

    if (!connectionString) {
        throw new Error(
            'PostgreSQL container not found. Make sure globalSetup is configured correctly.'
        );
    }

    // Connect to the shared database
    const client = new Client({ connectionString });
    await client.connect();

    // Get existing initial state (roles and admin user created in global setup)
    const { admin } = await getInitialDb(client);

    return {
        client,
        admin,
    };
};

export const closeDatabase = async (client: Client) => {
    try {
        await client.end();
    } catch (error) {
        console.warn('Error ending client:', error);
    }
};

export const resetDatabase = async (client: Client) => {
    // Only truncate tables that are populated during tests, keep the initial state
//     await client.query(`
//     TRUNCATE TABLE
//     sessions
//     RESTART IDENTITY CASCADE
//   `);
    await client.query(`DELETE FROM users WHERE email != 'admin@example.com'`);
};

export const login_request = async (app: App, email: string, password: string) => {
    return await request(app.getServer()).post('/api/v1/post-users/login').send({
        email,
        password,
    });
};

export const getAuthCookie = async (app: App, email: string, password: string) => {
    const user_response = await login_request(app, email, password);
    const cookies = user_response.headers['set-cookie'];
    return cookies;
};
