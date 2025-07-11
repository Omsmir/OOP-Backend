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
    BODYSIZELIMIT,
    SALTWORKFACTOR,
    ACCESSTOKENTTL,
    REFRESHTOKENTTL,
    APP_PASSWORD,
    SMTP_USER
} = process.env;

export default {
    accessTokenPublicKey: process.env.ACCESS_TOKEN_PUBLIC_KEY,
    accessTokenPrivateKey: process.env.ACCESS_TOKEN_PRIVATE_KEY,
    refreshTokenPrivateKey: process.env.REFRESH_PRIVATE_KEY,
    refreshTokenPublicKey: process.env.REFRESH_PUBLIC_KEY,
};
