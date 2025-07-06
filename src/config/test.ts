import { config } from 'dotenv';

config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

export const {
    NODE_ENV,
    PORT,
    MONGO_DB,
    MONGO_DB_URI,
    MONGO_DB_USER,
    MONGO_DB_PASSWD,
    LOG_FORMAT,
    LOG_DIR,
    ORIGIN,
    BODYSIZELIMIT
} = process.env;
