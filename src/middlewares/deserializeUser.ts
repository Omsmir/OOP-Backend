import { NextFunction, Request, Response } from 'express';
import { get } from 'lodash';
import { verifyJwt } from '../utils/jwt.sign';
import SessionService from '../services/session.service';
import { BaseController } from '@/controllers/base.controller';
import sessionRepository from '@/repository/session.repo';

class DeserializeMiddleware extends BaseController {
    constructor() {
        super();
    }

    public requireLogin = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = res.locals.user;

            if (!user) {
                res.status(401).json({ message: 'Expired session', sessionState: false });
                return;
            }

            console.log('deserialized user', user);
            res.locals.user = user;
            return next();
        } catch (error) {
            this.handleError(res, error);
        }
    };
}

export class DeserializeUser extends BaseController {
    constructor(private readonly sessionService: sessionRepository) {
        super();
    }

    public deserializeUser = async (req: Request, res: Response, next: NextFunction) => {
        const accessToken = get(req, 'headers.authorization', '')?.replace(/^Bearer\s/, '');

        const refreshToken = req.cookies['refreshToken'];

        if (!accessToken) {
            return next();
        }
        const { decoded, valid } = await verifyJwt(accessToken, 'accessTokenPublicKey', 'RS256');

        if (decoded) {
            res.locals.user = decoded;
            return next();
        }

        if (!valid && refreshToken) {
            const newAccessToken = await this.sessionService.reIssueAccessToken(refreshToken);

            if (newAccessToken) {
                res.setHeader('authorization', newAccessToken); // for redux store to access

                res.cookie('accessToken', newAccessToken, {
                    sameSite: 'strict',
                    httpOnly: true,
                    secure: true,
                    maxAge: 900 * 1000,
                });
            }

            const { decoded } = await verifyJwt(
                newAccessToken as string,
                'accessTokenPublicKey',
                'RS256'
            );

            res.locals.user = decoded;

            return next();
        }

        return next();
    };
}
export default DeserializeMiddleware;
