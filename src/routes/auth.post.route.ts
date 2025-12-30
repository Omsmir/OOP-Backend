import upload from '@/middlewares/multer';
import BaseRoute from './base.route';
import { validate } from '@/middlewares/validateResource';
import { createUserSchemaForPostgres, getAllUserForPostGresSchema } from '@/schemas/auth.schema';
import authController from '@/controllers/auth.postgres.controller';
import { loginSchema, logoutSchema } from '@/schemas/session.schema';
import DeserializeMiddleware from '@/middlewares/deserializeUser';


class authRoute extends BaseRoute {
    constructor(
        private readonly userController: authController,
        private readonly middlewares: DeserializeMiddleware
    ) {
        super('/post-users');
        this.initializeRoutes();
    }
    protected initializeRoutes(): void {
        this.router.post(
            `${this.path}/login`,
            upload.none(),
            validate(loginSchema),
            this.userController.login
        );
        this.router.post(
            `${this.path}`,
            upload.none(),
            validate(createUserSchemaForPostgres),
            this.userController.createUser
        );
        this.router.put(
            `${this.path}/logout/:id`,
            validate(logoutSchema),
            this.userController.logout
        );
        this.router.get(
            `${this.path}/:id`,
            this.middlewares.requireLogin,
            validate(getAllUserForPostGresSchema),
            this.userController.getAllUsersHandler
        );
    }
}

export default authRoute;
