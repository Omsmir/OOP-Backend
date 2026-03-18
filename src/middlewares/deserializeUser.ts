import { NextFunction, Request, Response } from 'express';
import { get } from 'lodash';
import { verifyJwt } from '../utils/jwt.sign';
import { BaseController } from '@/controllers/base.controller';
import sessionRepository from '@/repository/session.repo';
import { HASHING_ALGORITHMS, JWT_SECRET_KEYS, PERMISSIONS } from '@/interfaces/permissions';
import refreshTokenRepository from '@/repository/refresh_token.repo';
import HttpException from '@/exceptions/httpException';
import { ACCESSTOKENTTL } from '@/config/defaults';
export class DeserializeUser extends BaseController {
    constructor(
        private readonly sessionService: sessionRepository,
        private readonly refreshTokenRepo: refreshTokenRepository
    ) {
        super();
    }

    public deserializeUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const accessToken = get(req, 'headers.authorization', '')?.replace(/^Bearer\s/, '');

            const refreshToken = req.cookies['refreshToken'] as string | undefined;

            if (!accessToken) {
                return next();
            }
            const { decoded, valid } = await verifyJwt(
                accessToken,
                JWT_SECRET_KEYS.ACCESS_TOKEN_PUBLIC_KEY,
                HASHING_ALGORITHMS.RS256
            );

            if (decoded) {
                res.locals.user = decoded;
                return next();
            }

            if (!valid && refreshToken) {
                const {
                    accessToken: newAccessToken,
                    EXPIRATION_ERROR,
                    ITERATIONS_REACHED,
                    IS_VALID_ERROR,
                } = await this.refreshTokenRepo.reissueAccessToken({ refreshToken });

                if (EXPIRATION_ERROR || ITERATIONS_REACHED || IS_VALID_ERROR) {
                    if (EXPIRATION_ERROR) {
                        throw new HttpException(401, 'EXPIRED REFRESH TOKEN, please login again');
                    }
                    if (ITERATIONS_REACHED) {
                        throw new HttpException(
                            401,
                            'REFRESH TOKEN ITERATIONS LIMIT REACHED, possible token compromise, please login again'
                        );
                    }
                    if (IS_VALID_ERROR) {
                        throw new HttpException(
                            401,
                            'EXPIRED SESSION OR EXPIRED REFRESH TOKEN, please login again'
                        );
                    }
                }
                if (newAccessToken) {
                    res.setHeader('authorization', newAccessToken); // for redux store to access

                    res.cookie('accessToken', newAccessToken, {
                        sameSite: 'strict',
                        httpOnly: true,
                        secure: true,
                        maxAge: parseInt(ACCESSTOKENTTL as string) * 1000,
                    });
                }

                const { decoded } = await verifyJwt(
                    newAccessToken as string,
                    JWT_SECRET_KEYS.ACCESS_TOKEN_PUBLIC_KEY,
                    HASHING_ALGORITHMS.RS256
                );

                res.locals.user = decoded;

                return next();
            }

            return next();
        } catch (error) {
            this.handleError(res, error);
        }
    };
}
class DeserializeMiddleware extends BaseController {
    constructor() {
        super();
    }

    public requireLogin = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = res.locals.user;

            if (!user) {
                res.status(401).json({ message: 'You need to login again', sessionState: false });
                return;
            }

            return next();
        } catch (error) {
            this.handleError(res, error);
        }
    };

    public tamperingMiddleware = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = res.locals.user;
            const id = req.params.id;
            if (String(user.id) !== id) {
                res.status(403).json({ message: 'unauthorized operation' });
                return;
            }
            return next();
        } catch (error) {
            this.handleError(res, error);
        }
    };
    public authorize = (requiredPermissions: PERMISSIONS[]) => {
        return (req: Request, res: Response, next: NextFunction) => {
            try {
                const user = res.locals.user;
                if (!user) {
                    res.status(401).json({
                        message: 'You need to login again',
                        sessionState: false,
                    });
                    return;
                }

                const userPermissions: PERMISSIONS[] = user.permissions;

                if (userPermissions.includes(PERMISSIONS.ROOT_ADMIN)) {
                    return next();
                }

                const hasPermission = requiredPermissions.every((permission) =>
                    userPermissions.includes(permission)
                );

                if (!hasPermission) {
                    res.status(403).json({
                        message: 'unsufficient privileges to perform this action',
                    });
                    return;
                }
                return next();
            } catch (error) {
                this.handleError(res, error);
            }
        };
    };
}
export default DeserializeMiddleware;
