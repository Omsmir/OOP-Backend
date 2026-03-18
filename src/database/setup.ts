import {
    NODE_ENV,
    SEEDED_USER_NAME,
    SEEDED_USER_PASSWORD,
    TEST_SEEDED_EMAIL,
} from '@/config/defaults';
import { Admin, NormalUser, UserFactory } from '../classes/creationalPatterns';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { Client } from 'pg';
import { logger } from '@/utils/logger';

export const migrate = async (client: Client) => {
    try {
        const query = `CREATE TABLE IF NOT EXISTS _migrations (
        name TEXT PRIMARY KEY NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
        );`;

        await client.query(query);

        const dir = join(process.cwd(), 'migrations');

        const files = readdirSync(dir)
            .filter((file) => file.endsWith('.sql'))
            .sort();

        for (const file of files) {
            const res = await client.query(`SELECT 1 FROM _migrations WHERE name = $1`, [file]);

            if (res.rowCount && res.rowCount > 0) {
                console.log(`Skipping already run migration: ${file}`);
                continue;
            }

            console.log(`Running migration: ${file}`);

            const sql = readFileSync(join(dir, file), 'utf8');

            await client.query(sql);

            await client.query(`INSERT INTO _migrations(name) VALUES ($1)`, [file]);

            console.log(`Migration ${file} completed successfully.`);
        }
    } catch (error: any) {
        console.error(error.message);
        throw new Error(`something went bad while migrating ${error.message}`);
    }
};

export const seeding = async (client: Client) => {
    if (NODE_ENV === 'production') {
        logger.warn('Seeding skipped in production');
        return;
    }

    try {
        const query = `INSERT INTO users (name,email,password,role,permissions,age,gender) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(email) DO NOTHING`;

        const seeded_admin = await UserFactory.seeding_user({
            name: 'omar fouad',
            instance: new Admin(),
            email: String(SEEDED_USER_NAME),
            password: String(SEEDED_USER_PASSWORD),
        });

        if (NODE_ENV === 'test') {
            const user = await UserFactory.seeding_user({
                name: 'omar fouad',
                instance: new NormalUser(),
                email: String(TEST_SEEDED_EMAIL),
                password: String(SEEDED_USER_PASSWORD),
            });
            
            await client.query(query, [
                user.name,
                user.email,
                user.password,
                user.role,
                user.permissions,
                user.age,
                user.gender,
            ]);
            logger.info('seeding test users');
        }

        await client.query(query, [
            seeded_admin.name,
            seeded_admin.email,
            seeded_admin.password,
            seeded_admin.role,
            seeded_admin.permissions,
            seeded_admin.age,
            seeded_admin.gender,
        ]);

        logger.info(`seeding users into table procceded successfully`);
    } catch (error: any) {
        console.error(error.message);
        throw new Error(`something went bad while migrating ${error.message}`);
    }
};
