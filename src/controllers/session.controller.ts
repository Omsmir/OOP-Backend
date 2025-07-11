import SessionService from '@/services/session.service';
import { BaseController } from './base.controller';
import HttpException from '@/exceptions/httpException';
import { Request, Response } from 'express';
import UserService from '@/services/auth.service';
import { LoginSchemaInterface } from '@/schemas/session.schema';
import { signJwt } from '@/utils/jwt.sign';
import { ACCESSTOKENTTL, REFRESHTOKENTTL } from '@/config/defaults';

class SessionController extends BaseController {
    private sessionService: SessionService;
    private userService: UserService;
    constructor() {
        super();
        this.sessionService = new SessionService();
        this.userService = new UserService();
    }
    public loginHandler = async (
        req: Request<{}, {}, LoginSchemaInterface['body']>,
        res: Response
    ) => {
        try {
            const email = req.body.email;
            const password = req.body.password;

            const user = await this.userService.validatePassword({ email, password });

            if (!user) {
                throw new HttpException(400, 'invalid email or password');
            }
            const sessionObj = {
                role: user.role,
                user: user._id,
            };

            const session = await this.sessionService.createSession(sessionObj);

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

            res.status(200).json({
                message: 'logged in successfully',
                accessToken,
                refreshToken,
                session,
            });
        } catch (error) {
            this.handleError(res, error);
        }
    };
}

export default SessionController;
