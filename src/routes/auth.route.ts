import UserController from '@/controllers/auth.controller';
import { routes } from '@/interfaces/routes.interface';
import upload from '@/middlewares/multer';
import { validate } from '@/middlewares/validateResource';
import { createUserSchema, deleteUserSchema, updateUserSchema } from '@/schemas/auth.schema';
import { Router } from 'express';

// SOLID principles interpreted

// All the route Class is a single responsability
// interface segregation && liskov substitbution
class UserRoute implements routes {
    public path = '/users';
    public router = Router();
    // dependency injection: composition over inheritance
    constructor(private userController: UserController) {
        this.initializeRoute();
    }

    private initializeRoute() {
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
            this.userController.sendVerficationEmailToUnverifiedUsers
        );
    }
}

export default UserRoute;
