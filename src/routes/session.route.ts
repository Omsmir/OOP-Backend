import SessionController from '@/controllers/session.controller';
import { routes } from '@/interfaces/routes.interface';
import upload from '@/middlewares/multer';
import { validate } from '@/middlewares/validateResource';
import { loginSchema } from '@/schemas/session.schema';
import { Router } from 'express';

// SOLID principles interpreted

// All the route Class is a single responsability
// interface segregation && liskov substitbution
class SessionRoute implements routes {
    public path = '/auth';
    public router = Router();
    // dependency injection: composition over inheritance
    constructor(private sessionController: SessionController) {
        this.initializeRoute();
    }

    private initializeRoute() {
        this.router.post(
            this.path,
            upload.none(),
            validate(loginSchema),
            this.sessionController.loginHandler
        );
    }
}

export default SessionRoute;
