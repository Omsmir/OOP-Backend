import UserRepository from '@/repository/auth.repo';
import { BaseController } from './base.controller';
import HttpException from '@/exceptions/httpException';
import { profilePicture, UserToCreate } from '@/interfaces/models.interface';
import { Request, response, Response } from 'express';
import {
    createUserSchemaForPostgresInterface,
    getAllUserForPostGresSchemaInterface,
    updateUserSchemaForPostgresInterface,
} from '@/schemas/auth.schema';
import { LoginSchemaInterface, logoutSchemaInterface } from '@/schemas/session.schema';
import sessionRepository from '@/repository/session.repo';
import { signJwt } from '@/utils/jwt.sign';
import { ACCESSTOKENTTL, NODE_ENV, REFRESHTOKENTTL } from '@/config/defaults';
import S3, { S3_DIRECTORIES, S3Services } from '@/utils/s3';

class authController extends BaseController {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly sessionRepository: sessionRepository,
        private readonly s3: S3Services
    ) {
        super();
    }
    public createUser = async (
        req: Request<{}, {}, createUserSchemaForPostgresInterface['body']>,
        res: Response
    ) => {
        try {
            const existedUser = await this.userRepository.findUserByEmail(req.body.email);

            if (existedUser) {
                throw new HttpException(
                    403,
                    `user with email:${existedUser.email} is already exist`
                );
            }

            const user: UserToCreate = {
                ...req.body,
                age: Number(req.body.age),
                permissions: ['read', 'write'],
            };

            const createdUser = await this.userRepository.createUser(user);

            if (!createdUser) {
                throw new HttpException(400, 'error creaing user');
            }

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

            if (!user) {
                throw new HttpException(401, 'invalid email or password');
            }

            const session = await this.sessionRepository.createSession({
                user_id: user.id,
                user_agent: (req.headers['user-agent'] as string) || 'test',
            });

            if (!session) {
                throw new HttpException(400, 'error occurred while logging in');
            }

            const sessionObj = {
                id: user.id,
                permissions: user.permissions,
                name: user.name,
                role: user.role,
                gender: user.gender,
                session: session.id,
            };

            const accessToken = await signJwt(
                { ...sessionObj, email: user.email },
                'accessTokenPrivateKey',
                'RS256',
                {
                    expiresIn: parseInt(ACCESSTOKENTTL as string),
                }
            );

            const refreshToken = await signJwt(
                { ...sessionObj, email: user.email },
                'refreshTokenPrivateKey',
                'RS256',
                {
                    expiresIn: parseInt(REFRESHTOKENTTL as string),
                }
            );

            res.cookie('refreshToken', refreshToken, {
                sameSite: 'strict',
                httpOnly: true,
                secure: NODE_ENV === 'production',
                maxAge: 30 * 24 * 60 * 60 * 1000,
            });

            res.cookie('accessToken', accessToken, {
                sameSite: 'strict',
                httpOnly: true,
                secure: NODE_ENV === 'production',
                maxAge: 900 * 1000,
            });

            res.status(200).json({ message: 'logged in successfully', accessToken });
        } catch (error) {
            this.handleError(res, error);
        }
    };

    public logout = async (req: Request<logoutSchemaInterface['params']>, res: Response) => {
        try {
            const local_user = res.locals.user;
            const id = req.params.id;

            if (String(local_user.id) !== id) {
                throw new HttpException(409, 'unauthorized operation');
            }

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
            const id = req.params.id;
            const local_user = res.locals.user;

            if (id !== String(local_user.id)) {
                throw new HttpException(401, 'unauthorized operation');
            }

            const is_admin = await this.userRepository.getUserById(id);

            if (!is_admin) {
                throw new HttpException(404, 'user not found');
            }

            if (is_admin.role !== 'admin') {
                throw new HttpException(403, 'unsufficient privillages');
            }

            const users = await this.userRepository.getAllUsers(id);

            if (!users || users.length < 1) {
                throw new HttpException(404, 'No user found');
            }

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
            const local_user = res.locals.user;
            const file = req.file as Express.Multer.File;
            let profile_picture: profilePicture | null = null;

            if (String(local_user.id) !== id) {
                throw new HttpException(409, 'unauthorized operation');
            }
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

                await this.userRepository.UpdateProfilePicture(id, profile_picture);
            }

            const updatedUser = await this.userRepository.updateUser(id, {
                ...req.body,
                age: (req.body.age && Number(req.body.age)) || undefined,
            });

            res.status(200).json({ message: 'user updated successfully', user: updatedUser });
        } catch (error) {
            this.handleError(res, error);
        }
    };
}

export default authController;
