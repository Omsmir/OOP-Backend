import UserRepository from '@/repository/auth.repo';
import { BaseController } from './base.controller';
import HttpException from '@/exceptions/httpException';
import { profilePicture, UserInterface, UserToCreate } from '@/interfaces/models.interface';
import { Request, Response } from 'express';
import {
    CHANGE_KEY_QUERY,
    createUserSchemaForPostgresInterface,
    getAllUserForPostGresSchemaInterface,
    updateUserSchemaForPostgresInterface,
} from '@/schemas/auth.schema';
import { LoginSchemaInterface, logoutSchemaInterface } from '@/schemas/session.schema';
import sessionRepository from '@/repository/session.repo';
import { signJwt } from '@/utils/jwt.sign';
import { ACCESSTOKENTTL, NODE_ENV, REFRESHTOKENTTL } from '@/config/defaults';
import { S3_DIRECTORIES, S3Services } from '@/integrations/s3';
import { UserFactory } from '@/classes/creationalPatterns';
import { CACHE_TTL, REDIS_CACHE_KEYS, RedisServices } from '@/utils/redis';
import BullWorkers, { WORKER_TYPES } from '@/integrations/workers';
import refreshTokenRepository from '@/repository/refresh_token.repo';
import { logger } from '@/utils/logger';

class authController extends BaseController {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly refreshTokenRepository: refreshTokenRepository,
        private readonly sessionRepository: sessionRepository,
        private readonly redis_services: RedisServices,
        private readonly workers: BullWorkers,
        private readonly s3: S3Services,
        private readonly user_factory: UserFactory
    ) {
        super();
    }
    public createUser = async (
        req: Request<{}, {}, createUserSchemaForPostgresInterface['body']>,
        res: Response
    ) => {
        try {
            const existedUser = await this.userRepository.findUserByEmail(req.body.email);
            const queue = this.workers.getQueue(WORKER_TYPES.EMAIL_VERIFICATION);

            if (existedUser) {
                throw new HttpException(
                    403,
                    `user with email:${existedUser.email} is already exist`
                );
            }

            const createdUserInstance = this.user_factory.create(req.body.role); // methodololgy for an internal system not intended for public use.

            if (createdUserInstance instanceof Error) {
                throw new HttpException(400, 'error creating user instance'); // will fail at validation before it hits the factory
            }

            const user: UserToCreate = {
                ...req.body,
                role: createdUserInstance.role,
                age: Number(req.body.age),
                permissions: createdUserInstance.permissions(),
            };

            const createdUser = await this.userRepository.createUser(user);

            await queue.add('EMAIL_VERIFICATION_MESSAGE', {
                email: createdUser.email,
            });

            res.status(201).json({ message: 'user created successfully', createdUser });
        } catch (error) {
            this.handleError(res, error);
        }
    };

    public login = async (req: Request<{}, {}, LoginSchemaInterface['body']>, res: Response) => {
        try {
            const email = req.body.email;
            const password = req.body.password;

            const user = await this.userRepository.validateUser(email, password);

            const login_attempts = await this.redis_services.checkHash({
                redis_cache_key: REDIS_CACHE_KEYS.LOGIN_ATTEMPTS,
                hash_name: email,
                value: 'attempts',
            });

            const loginAttemptsHashCreating = async (login_attempts?: string) => {
                await this.redis_services.createHash({
                    redis_cache_key: REDIS_CACHE_KEYS.LOGIN_ATTEMPTS,
                    hash_name: email,
                    content: { attempts: String(parseInt(login_attempts || '0') + 1) },
                    expire: CACHE_TTL.TEN_MINUTES,
                });
            };
            if (login_attempts && parseInt(login_attempts) >= 5) {
                throw new HttpException(429, 'too many login attempts, please try again later');
            }
            if (!user) {
                if (login_attempts) {
                    await loginAttemptsHashCreating(login_attempts);
                } else {
                    await loginAttemptsHashCreating();
                }
                throw new HttpException(403, 'invalid email or password');
            }

            await this.redis_services.DelHash({
                redis_cache_key: REDIS_CACHE_KEYS.LOGIN_ATTEMPTS,
                hash_name: email,
                value: 'attempts',
            });

            // invalidating all pervious sessions for security hardening
            await this.sessionRepository.updateSession(user.id, false);

            const session = await this.sessionRepository.createSession({
                user_id: user.id,
                user_agent: (req.headers['user-agent'] as string) || 'test',
            });

            const TOKEN = await this.refreshTokenRepository.findRefreshTokensByUserIdAndOther({
                userId: user.id,
                is_valid: true,
            });

            if (TOKEN) {
                await this.refreshTokenRepository.invalidateRefreshToken({ tokenId: TOKEN.id });
            } else {
                logger.warn(
                    `no valid refresh token found for user with id ${user.id} during login, creating a new one`
                ); // should be refactored to apply to OWSAP for audit logging and monitoring for first time logins
            }

            if (!session) {
                throw new HttpException(400, 'error occurred while logging in');
            }

            const { refreshToken, accessToken } =
                await this.refreshTokenRepository.signRefreshAndAccessToken({
                    userId: user.id,
                    sessionId: session.id,
                    first_time: true,
                });

            const hashed_token = await this.refreshTokenRepository.hashRefreshToken(refreshToken);

            if (TOKEN) {
                await this.refreshTokenRepository.findAndUpdateRefreshTokenReplacedBy({
                    newToken: hashed_token,
                    tokenId: TOKEN.id,
                });
            }
            await this.refreshTokenRepository.StoreRefreshToken({
                userId: user.id,
                token: hashed_token,
            });

            res.cookie('refreshToken', refreshToken, {
                sameSite: 'strict',
                httpOnly: true,
                secure: NODE_ENV === 'production',
                maxAge: parseInt(REFRESHTOKENTTL as string) * 1000, // 24 hours
            });

            res.cookie('accessToken', accessToken, {
                sameSite: 'strict',
                httpOnly: true,
                secure: NODE_ENV === 'production',
                maxAge: parseInt(ACCESSTOKENTTL as string) * 1000,
            });

            res.status(200).json({ message: 'logged in successfully', accessToken });
        } catch (error) {
            this.handleError(res, error);
        }
    };

    public logout = async (req: Request<logoutSchemaInterface['params']>, res: Response) => {
        try {
            const id = req.params.id;

            await this.sessionRepository.updateSession(id, false);

            res.clearCookie('accessToken');

            res.clearCookie('refreshToken');

            res.status(200).json({ message: 'logged out ' });
        } catch (error) {
            this.handleError(res, error);
        }
    };

    public getAllUsersHandler = async (
        req: Request<getAllUserForPostGresSchemaInterface['params']>,
        res: Response
    ) => {
        try {
            const local_user = res.locals.user;

            const cached_users = await this.redis_services.checkHash({
                redis_cache_key: REDIS_CACHE_KEYS.USERS_KEY,
                hash_name: local_user.role,
                value: 'users',
            });

            if (cached_users) {
                const users = JSON.parse(cached_users);
                res.status(200).json({ message: 'cached users', users });
                return;
            }

            const users = await this.userRepository.getAllUsers(local_user.id);

            if (!users || users.length < 1) {
                throw new HttpException(404, 'No user found');
            }

            await this.redis_services.createHash({
                redis_cache_key: REDIS_CACHE_KEYS.USERS_KEY,
                hash_name: local_user.role, // any user with the same role will be having the same privileges so we can cache them together
                content: { users: JSON.stringify(users) },
                expire: CACHE_TTL.TEN_MINUTES, // 10 minutes
            });

            res.status(200).json({ message: 'users found', users });
        } catch (error) {
            this.handleError(res, error);
        }
    };

    public updateUserHandler = async (
        req: Request<
            updateUserSchemaForPostgresInterface['params'],
            {},
            updateUserSchemaForPostgresInterface['body']
        >,
        res: Response
    ) => {
        try {
            const id = req.params.id;
            const file = req.file as Express.Multer.File;
            let updatedUser: UserInterface | null = null;
            let change_key;
            const other_values = [];

            Object.entries(req.body).forEach(([_, value]) => {
                if (value) {
                    other_values.push(value);
                }
            });

            if (file && other_values.length > 0) {
                change_key = CHANGE_KEY_QUERY.PROFILEANDOTHER;
            } else if (file) {
                change_key = CHANGE_KEY_QUERY.PROFILE_PICTURE;
            } else if (other_values.length > 0) {
                change_key = CHANGE_KEY_QUERY.OTHER;
            }

            const upload_profile_picture = async () => {
                let profile_picture: profilePicture | null = null;
                if (file) {
                    const Key = `${id}`;

                    const url = await this.s3.uploadFile({
                        Key,
                        Directory: S3_DIRECTORIES.PROFILE_PICTURES,
                        ContentType: file.mimetype,
                        Body: file.buffer,
                    });

                    if (!url) {
                        throw new HttpException(400, 'Error upload profile picture');
                    }

                    profile_picture = {
                        url,
                        name: file.originalname,
                        content_type: file.mimetype,
                    };
                }
                return profile_picture;
            };

            switch (change_key) {
                case CHANGE_KEY_QUERY.PROFILE_PICTURE:
                    const profile_picture = await upload_profile_picture();

                    updatedUser = await this.userRepository.UpdateProfilePicture(
                        id,
                        profile_picture
                    );

                    break;
                case CHANGE_KEY_QUERY.PROFILEANDOTHER:
                    if (file) {
                        const profile_picture = await upload_profile_picture();

                        await this.userRepository.UpdateProfilePicture(id, profile_picture);
                    }
                    updatedUser = await this.userRepository.updateUser(id, {
                        ...req.body,
                        age: Number(req.body.age),
                    });
                    break;
                case CHANGE_KEY_QUERY.OTHER:
                    updatedUser = await this.userRepository.updateUser(id, {
                        ...req.body,
                        age: Number(req.body.age),
                    });
                    break;
            }

            if (!updatedUser) {
                throw new HttpException(200, 'no changes were made');
            }
            res.status(200).json({ message: 'user updated successfully', user: updatedUser });
        } catch (error) {
            this.handleError(res, error);
        }
    };
}

export default authController;
