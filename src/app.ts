import { BODYSIZELIMIT, LOG_FORMAT, NODE_ENV, ORIGIN, PORT } from './config/defaults';
import express from 'express';
import MongoConnection from './utils/MongoConnection';
import { routes } from './interfaces/routes.interface';
import morgan from 'morgan';
import { logger, stream } from './utils/logger';
import cors from 'cors';
import hpp from 'hpp';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { ErrorHandler } from './middlewares/error.middleware';
import http from 'http';
import {  sanitizeRequest } from './middlewares/xss';
import { Logger } from './classes/structural.class';

class App {
    public PORT: string | number;
    public env: string;
    public app: express.Application;
    public server: http.Server;
    public mongoConnection: MongoConnection;

    constructor(routes: routes[]) {
        this.PORT = PORT || 8090;
        this.env = NODE_ENV || 'development';
        this.app = express();
        this.server = http.createServer(this.app);
        this.mongoConnection = MongoConnection.getInstance();

        this.initializeMiddlewares();
        this.initializeRoutes(routes);
        this.initializeErrorMiddlewares();
    }

    public listen() {
        this.server.listen(this.PORT, async () => {
            logger.warn(`===== http://localhost:${this.PORT} =====`);
            logger.info(`===========${this.env}===========`);
            logger.info(`===========port:${this.PORT}=============`);
            logger.info(`=================================`);
            Logger.log(`========================================`)
        });
    }

    private initializeRoutes(routes: routes[]) {
        routes.forEach((route: routes) => {
            this.app.use('/api', route.router);
        });
    }

    private async initializeMiddlewares() {
        this.app.use(morgan(LOG_FORMAT || 'dev', { stream }));
        this.app.use(cors({ origin: ORIGIN, credentials: true }));
        this.app.use(hpp({ checkBody: true }));
        this.app.use(helmet());
        this.app.use(compression());
        this.app.use(express.json({ limit: BODYSIZELIMIT }));
        this.app.use(express.urlencoded({ extended: true, limit: BODYSIZELIMIT }));
        this.app.use(cookieParser());
        this.app.use(sanitizeRequest)
    }

    private initializeErrorMiddlewares() {
        this.app.use(ErrorHandler);
    }

    static createInstance(routes: routes[]): App {
        return new App(routes);
    }

    public getServer() {
        // specfic for testing
        return this.app;
    }
}

export default App;
