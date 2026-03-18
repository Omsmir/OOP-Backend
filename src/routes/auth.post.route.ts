import upload from '@/middlewares/multer';
import BaseRoute from './base.route';
import { validate } from '@/middlewares/validateResource';
import {
    createUserSchemaForPostgres,
    getAllUserForPostGresSchema,
    updateUserSchemaForPostgres,
} from '@/schemas/auth.schema';
import authController from '@/controllers/auth.postgres.controller';
import { loginSchema, logoutSchema } from '@/schemas/session.schema';
import DeserializeMiddleware from '@/middlewares/deserializeUser';
import { PERMISSIONS } from '@/interfaces/permissions';
import RateLimiters from '@/middlewares/rateLimiters';

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
            this.middlewares.requireLogin,
            this.middlewares.authorize([PERMISSIONS.USER_CREATE, PERMISSIONS.USER_DELETE]),
            upload.none(),
            validate(createUserSchemaForPostgres),
            this.userController.createUser
        );
        this.router.put(
            `${this.path}/logout/:id`,
            this.middlewares.requireLogin,
            this.middlewares.tamperingMiddleware,
            validate(logoutSchema),
            this.userController.logout
        );
        this.router.get(
            `${this.path}/:id`,
            this.middlewares.requireLogin,
            this.middlewares.tamperingMiddleware,
            this.middlewares.authorize([
                PERMISSIONS.USER_CREATE,
                PERMISSIONS.USER_DELETE,
                PERMISSIONS.USER_READ, // or can be
                PERMISSIONS.ROOT_ADMIN, // this only if it has to be for admin
            ]),
            validate(getAllUserForPostGresSchema),
            this.userController.getAllUsersHandler
        );
        this.router.put(
            `${this.path}/:id`,
            this.middlewares.requireLogin,
            this.middlewares.tamperingMiddleware,
            RateLimiters.create({
                windowMs: 15 * 60 * 1000,
                max: 5,
                message: 'Too many profile update requests from this IP, please try again later.',
            }),
            this.middlewares.authorize([PERMISSIONS.USER_PROFILE_UPDATE]),
            upload.single('profileImg'),
            validate(updateUserSchemaForPostgres),
            this.userController.updateUserHandler
        );
    }
}

export default authRoute;
