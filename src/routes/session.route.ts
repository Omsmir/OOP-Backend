import SessionController from '@/controllers/session.controller';
import upload from '@/middlewares/multer';
import { validate } from '@/middlewares/validateResource';
import { loginSchema } from '@/schemas/session.schema';
import BaseRoute from './base.route';

// SOLID principles interpreted

// All the route Class is a single responsability
// interface segregation && liskov substitbution
class SessionRoute extends BaseRoute {

    // dependency injection: composition over inheritance
    constructor(private sessionController: SessionController) {
        super('/auth');
        this.initializeRoutes();
    }

    protected initializeRoutes() {
        this.router.post(
            this.path,
            upload.none(),
            validate(loginSchema),
            this.sessionController.loginHandler
        );
    }
}

export default SessionRoute;
