import {
    APIS_MAIN_ENDPOINT,
    APIS_VERSION,
    BODYSIZELIMIT,
    LOG_FORMAT,
    NODE_ENV,
    ORIGIN,
    PORT,
} from './config/defaults';
import SentryWrapper from './utils/sentry';
import express from 'express';
import MongoConnection from './utils/MongoConnection';
import morgan from 'morgan';
import { logger, stream } from './utils/logger';
import cors from 'cors';
import hpp from 'hpp';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { ErrorHandler } from './middlewares/error.middleware';
import http from 'http';
import { sanitizeRequest } from './middlewares/xss';
import { CreationalClassesPattern } from './classes/creationalPatterns';
import { BehavioralClassesPattern } from './classes/behavioral.class';
import DeserializeMiddleware, { DeserializeUser } from './middlewares/deserializeUser';
import { developedBy, OOP, SIGNALS } from './utils/constants';
import { gracefulShutdown } from './utils/gracefulEvents';
import PostgresConnection from './utils/postgres';
import BaseRoute from './routes/base.route';
import { RunMigrations } from './database/mirgrations';
import sessionRepository from './repository/session.repo';

class App {
    public PORT: string | number;
    public env: string;
    public app: express.Application;
    public server: http.Server;
    public mongoConnection: MongoConnection;
    public postgresConnection: PostgresConnection;
    private postgresMigrations: RunMigrations;
    private deserializeUserMiddleware: DeserializeUser;
    constructor(routes: BaseRoute[]) {
        this.PORT = PORT || 8090;
        this.env = NODE_ENV || 'development';
        this.app = express();
        this.server = http.createServer(this.app);
        this.mongoConnection = MongoConnection.getInstance();
        this.postgresMigrations = RunMigrations.getInstance();

        if (NODE_ENV !== 'test') {
            this.initPostgresMigrations();
        }
        this.postgresConnection = PostgresConnection.getInstance();
        this.deserializeUserMiddleware = new DeserializeUser(
            new sessionRepository(this.postgresConnection)
        );

        this.initializeMiddlewares();
        this.initializeDeserializers();
        this.initializeRoutes(routes);
        this.initializeErrorMiddlewares();
        this.initializeClasses();
        this.setupGracefulShutdown();
    }

    public listen() {
        this.server.listen(this.PORT, async () => {
            logger.info(`\n${OOP}\n${developedBy}`);
            logger.info(`===== http://localhost:${this.PORT} =====`);
            logger.info(`===========${this.env}===========`);
            logger.info(`===========port:${this.PORT}=============`);
            logger.info(`=================================`);
        });
    }

    private initializeRoutes(routes: BaseRoute[]) {
        routes.forEach((route: BaseRoute) => {
            this.app.use(`/${APIS_MAIN_ENDPOINT}/${APIS_VERSION}`, route.router);
        });
    }

    private async initializeMiddlewares() {
        this.app.use(morgan(LOG_FORMAT || 'dev', { stream }));
        this.app.use(
            cors({ origin: ORIGIN, credentials: true, allowedHeaders: ['authorization'] })
        );
        this.app.use(hpp({ checkBody: true }));
        this.app.use(helmet());
        this.app.use(compression());
        this.app.use(express.json({ limit: BODYSIZELIMIT }));
        this.app.use(express.urlencoded({ extended: true, limit: BODYSIZELIMIT }));
        this.app.use(cookieParser());
        this.app.use(sanitizeRequest);
    }

    private async initializeDeserializers() {
        this.app.use(this.deserializeUserMiddleware.deserializeUser);
    }
    private initializeErrorMiddlewares() {
        this.app.use(ErrorHandler);
    }

    static createInstance(routes: BaseRoute[]): App {
        return new App(routes);
    }

    private initializeClasses() {
        // this method starts with the server for initiating the classes Folder independently without the need for using any instance in any seperate folders
        //  eg.(controllers, services) to witness results
        // you only need to use the getInstance method implemented at the very top of each file inside the classes folder
        // to see the console logs of these classes or files

        // NOTE: initialize every class alone just to focus on the results
        CreationalClassesPattern.getInstance(); // Creational patterns file initialization
        // StructuralClassesPattern.getInstance()  // commented to watch the CreationalClass results efficiently
        BehavioralClassesPattern.getInstance();
    }

    public getServer() {
        // specfic for testing
        return this.app;
    }

    private initPostgresMigrations = async () => {
        await this.postgresMigrations.main();
    };


    private initSentry = () => {
        return SentryWrapper.getInstance().initSentry()
    }
    private async setupGracefulShutdown() {
        for (const signal of SIGNALS) {
            process.on(signal, async () => await gracefulShutdown.shutdown(signal));
        }
    }
}

export default App;
