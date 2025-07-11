import UserController from './controllers/auth.controller';
import SessionController from './controllers/session.controller';
import UserRoute from './routes/auth.route';
import BookRoute from './routes/book.route';
import CarRoute from './routes/car.route';
import IndexRoute from './routes/index.route';
import SessionRoute from './routes/session.route';

export const Routes = [
    new IndexRoute(),
    new CarRoute(),
    new BookRoute(),
    new SessionRoute(new SessionController()),
    new UserRoute(new UserController()),
];
