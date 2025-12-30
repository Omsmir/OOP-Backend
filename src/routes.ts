import { CommandInvoker } from './classes/behavioral.class';
import { UserFactory } from './classes/creationalPatterns';
import UserController from './controllers/auth.controller';
import authController from './controllers/auth.postgres.controller';
import SessionController from './controllers/session.controller';
import DeserializeMiddleware from './middlewares/deserializeUser';
import UserRepository from './repository/auth.repo';
import sessionRepository from './repository/session.repo';
import authRoute from './routes/auth.post.route';
import UserRoute from './routes/auth.route';
import BookRoute from './routes/book.route';
import CarRoute from './routes/car.route';
import IndexRoute from './routes/index.route';
import SessionRoute from './routes/session.route';
import UserService from './services/auth.service';
import PostgresConnection from './utils/postgres';

const invoker = new CommandInvoker();
const userService = new UserService();
const userFactory = new UserFactory();

const DB = PostgresConnection.getInstance();

const users_respository = new UserRepository(DB);
const session_respository = new sessionRepository(DB);

const post_auth_controller = new authController(users_respository, session_respository);
const middlewares = new DeserializeMiddleware();

export const Routes = [
    new IndexRoute(),
    new CarRoute(),
    new BookRoute(),
    new SessionRoute(new SessionController()),
    new UserRoute(new UserController(userService, invoker, userFactory), middlewares),
    new authRoute(post_auth_controller, middlewares),
];
