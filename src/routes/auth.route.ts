import UserController from '@/controllers/auth.controller';
import upload from '@/middlewares/multer';
import { validate } from '@/middlewares/validateResource';
import { createUserSchema, deleteUserSchema, updateUserSchema } from '@/schemas/auth.schema';
import BaseRoute from './base.route';
import DeserializeMiddleware from '@/middlewares/deserializeUser';

// SOLID principles interpreted

// All the route Class is a single responsability
// interface segregation && liskov substitbution
class UserRoute extends BaseRoute {
    // dependency injection: composition over inheritance
    constructor(
        private readonly userController: UserController,
        private readonly middleware: DeserializeMiddleware
    ) {
        super('/users');

        this.initializeRoutes();
    }

    protected initializeRoutes() {
        this.router.post(
            `${this.path}/:id`,
            upload.none(),
            validate(createUserSchema),
            this.userController.createUserHandler
        );
        this.router.delete(
            `${this.path}/:id`,
            upload.none(),
            validate(deleteUserSchema),
            this.userController.deleteUserHandler
        );
        this.router.put(
            `${this.path}/:id`,
            upload.none(),
            validate(updateUserSchema),
            this.userController.updateUserHandler
        );
        this.router.post(
            `${this.path}/send/email`,
            this.middleware.requireLogin,
            this.userController.sendVerficationEmailToUnverifiedUsers
        );
    }
}

export default UserRoute;
