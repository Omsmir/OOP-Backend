import { MONGO_DB, MONGO_DB_PASSWD, MONGO_DB_URI, MONGO_DB_USER } from '../config/defaults';
import { logger } from './logger';
import mongoose from 'mongoose';

// Singleton Design Pattern
class MongoConnection {
    private static MONGO_DB_URI: string;
    private static MONGO_DB_NAME: string;
    private static instance: MongoConnection;

    private constructor() {
        MongoConnection.MONGO_DB_URI = MONGO_DB_URI || 'mongodb+srv://cluster0.y7dljqp.mongodb.net/';
        MongoConnection.MONGO_DB_NAME = MONGO_DB || 'test';
        this.initializeConnection();
    }

    static getInstance(): MongoConnection {
        if (!MongoConnection.instance) {
            MongoConnection.instance = new MongoConnection();
        }
        return MongoConnection.instance;
    }
    private async initializeConnection() {
        try {
            const connection = await mongoose.connect(MongoConnection.MONGO_DB_URI, {
                user: MONGO_DB_USER,
                pass: MONGO_DB_PASSWD,
                dbName: MongoConnection.MONGO_DB_NAME,
            });
            logger.info(`Mongodb is connected to database:${connection.connection.name}`);
        } catch (error: any) {
            logger.error(error.message);
            throw new Error(error.message);
        }
    }
}

export default MongoConnection;
