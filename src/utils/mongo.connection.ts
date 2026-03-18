import { MONGO_DB, MONGO_DB_PASSWD, MONGO_DB_URI, MONGO_DB_USER } from '../config/defaults';
import { logger } from './logger';
import mongoose from 'mongoose';

// Singleton Design Pattern
class MongoConnection {
    private static instance: MongoConnection;

    private constructor() {
        this.initializeConnection();
    }

    public static getInstance(): MongoConnection {
        if (!MongoConnection.instance) {
            MongoConnection.instance = new MongoConnection();
        }
        return MongoConnection.instance;
    }

    public static async CloseConnection() {
        if (MongoConnection.instance) {
            await mongoose.connection
                .close()
                .then(() => logger.info('Mongodb connection closed successfully'))
                .catch((error: any) =>
                    logger.error(`Error closing MongoDB connection: ${error.message}`)
                );
        }
        logger.warn('mongo connection is not initialized');
    }
    private async initializeConnection() {
        try {
            await mongoose
                .connect(MONGO_DB_URI || 'mongodb+srv://cluster0.y7dljqp.mongodb.net/', {
                    user: MONGO_DB_USER,
                    pass: MONGO_DB_PASSWD,
                    dbName: MONGO_DB || 'test',
                })
                .then((conn) =>
                    logger.info(`Mongodb is connected to database:${conn.connection.name}`)
                )
                .catch((error: any) => {
                    logger.error(`Error connecting to MongoDB: ${error.message}`);
                });
        } catch (error: any) {
            logger.error(error.message);
            throw new Error(error.message);
        }
    }
}

export default MongoConnection;
