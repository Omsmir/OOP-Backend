import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { Client } from 'pg';

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
        }
    } catch (error: any) {
        console.error(error.message);
        throw new Error(`something went bad while migrating ${error.message}`);
    }
};
