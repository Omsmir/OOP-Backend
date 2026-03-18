import { PostgresInterface } from '@/interfaces/global.interface';
import UserRepository from './auth.repo';
import { ACCESSTOKENTTL, REFRESH_TOKEN_MAX_ITERATIONS, REFRESHTOKENTTL } from '@/config/defaults';
import bcryptjs from 'bcryptjs';
import { addDays } from 'date-fns';
import { signJwt, verifyJwt } from '@/utils/jwt.sign';
import { get } from 'lodash';
import sessionRepository from './session.repo';
import { RefreshToken } from '@/interfaces/models.interface';
import {
    checkRefreshTokenValidityProps,
    findAndUpdateRefreshTokenReplacedByProps,
    findRefreshTokenByIdProps,
    findRefreshTokensByUserIdProps,
    hashAndStoreRefreshTokenProps,
    refreshTokenReissueResult,
    signRefreshAndAccessTokenProps,
} from '@/interfaces/repo.interface';
import { hashing_password } from '@/utils/hashing';
import { HASHING_ALGORITHMS, JWT_SECRET_KEYS } from '@/interfaces/permissions';

class refreshTokenRepository {
    constructor(
        private readonly DB: PostgresInterface,
        private readonly userRepository: UserRepository,
        private readonly sessionRepository: sessionRepository
    ) {}

    public signRefreshAndAccessToken = async ({
        userId,
        sessionId,
        first_time,
    }: signRefreshAndAccessTokenProps): Promise<{
        refreshToken: string;
        accessToken: string | null;
    }> => {
        const user = await this.userRepository.findUserById({ id: userId });

        if (!user) return { refreshToken: '', accessToken: null };

        const session_object = {
            id: user.id,
            permissions: user.permissions,
            name: user.name,
            role: user.role,
            gender: user.gender,
            session: sessionId,
            email: user.email,
        };
        console.log(session_object);
        const refreshToken = await signJwt(
            session_object,
            JWT_SECRET_KEYS.REFRESH_TOKEN_PRIVATE_KEY,
            HASHING_ALGORITHMS.RS256,
            {
                expiresIn: parseInt(REFRESHTOKENTTL as string),
            }
        );
        let accessToken: string | null = null;

        if (first_time) {
            accessToken = await signJwt(
                session_object,
                JWT_SECRET_KEYS.ACCESS_TOKEN_PRIVATE_KEY,
                HASHING_ALGORITHMS.RS256,
                {
                    expiresIn: parseInt(ACCESSTOKENTTL as string),
                }
            );
        }

        return { refreshToken, accessToken };
    };

    public findRefreshTokenById = async ({
        tokenId,
    }: findRefreshTokenByIdProps): Promise<RefreshToken | null> => {
        const query = `SELECT * FROM refresh_tokens WHERE id = $1 LIMIT 1`;
        const result = await this.DB.query(query, [tokenId]);

        if (result.rowCount === 0) return null;
        return result.rows[0] as RefreshToken;
    };
    public StoreRefreshToken = async ({
        userId,
        token,
    }: hashAndStoreRefreshTokenProps): Promise<RefreshToken | undefined> => {
        const query = `INSERT INTO refresh_tokens (user_id, token, expired_at) VALUES ($1, $2, $3) RETURNING *`;

        const expired_at = addDays(
            new Date(),
            parseInt(REFRESHTOKENTTL as string) / (24 * 60 * 60)
        ); // 1 days expiration

        const values = [userId, token, expired_at];

        const result = await this.DB.query(query, values);

        if (result.rowCount === 0) return undefined;

        return result.rows[0] as RefreshToken;
    };
    public findRefreshTokensByUserIdAndOther = async ({
        userId,
        is_valid,
    }: findRefreshTokensByUserIdProps): Promise<RefreshToken | null> => {
        const query = `SELECT * FROM refresh_tokens WHERE user_id = $1 AND is_valid = $2 LIMIT 1`;

        const values = [userId, is_valid];

        const result = await this.DB.query(query, values);

        if (result.rowCount === 0) return null;

        return result.rows[0] as RefreshToken;
    };

    public findRefreshTokensByUserId = async ({
        userId,
    }: {
        userId: string;
    }): Promise<RefreshToken | null> => {
        const query = `SELECT * FROM refresh_tokens WHERE user_id = $1  LIMIT 1`;

        const value = [userId];

        const result = await this.DB.query(query, value);

        if (result.rowCount === 0) return null;

        return result.rows[0] as RefreshToken;
    };

    public invalidateRefreshToken = async ({
        tokenId,
    }: findRefreshTokenByIdProps): Promise<RefreshToken | null> => {
        const query = `UPDATE refresh_tokens SET is_valid = false WHERE id = $1 RETURNING * `;

        const result = await this.DB.query(query, [tokenId]);

        if (result.rowCount === 0) return null;

        return result.rows[0] as RefreshToken;
    };

    public findAndUpdateRefreshTokenIterations = async ({
        tokenId,
    }: findRefreshTokenByIdProps): Promise<RefreshToken | null> => {
        const query = `UPDATE refresh_tokens SET iterations = $1 WHERE id = $2 RETURNING *`;

        const exitedRefreshToken = await this.DB.query(
            `SELECT * FROM refresh_tokens WHERE id = $1 LIMIT 1`,
            [tokenId]
        );

        if (exitedRefreshToken.rowCount === 0) return null;

        const iterations = exitedRefreshToken.rows[0].iterations + 1;

        const result = await this.DB.query(query, [iterations, tokenId]);

        if (result.rowCount === 0) return null;

        return result.rows[0] as RefreshToken;
    };

    public hashRefreshToken = async (token: string): Promise<string> => {
        const hashed_token = await hashing_password(token);

        return hashed_token;
    };

    public findAndUpdateRefreshTokenReplacedBy = async ({
        tokenId,
        newToken,
    }: findAndUpdateRefreshTokenReplacedByProps): Promise<RefreshToken | null> => {
        const query = `UPDATE refresh_tokens SET replaced_by = $1 WHERE id = $2 RETURNING *`;

        const newRefreshToken = await this.DB.query(
            `SELECT * FROM refresh_tokens WHERE id = $1 LIMIT 1`,
            [tokenId]
        );

        if (newRefreshToken.rowCount === 0) return null;

        const result = await this.DB.query(query, [newToken, tokenId]);

        if (result.rowCount === 0) return null;

        return result.rows[0] as RefreshToken;
    };

    public checkRefreshTokenValidity = async ({
        tokenId,
        refreshToken,
    }: checkRefreshTokenValidityProps): Promise<{
        EXPIRATION_ERROR: boolean;
        IS_VALID_ERROR: boolean;
        ITERATIONS_REACHED: boolean;
    }> => {
        const existed_token = await this.findRefreshTokenById({ tokenId });

        if (!existed_token || !existed_token.is_valid)
            return { EXPIRATION_ERROR: false, IS_VALID_ERROR: true, ITERATIONS_REACHED: false };

        const bcrypt_validation = await bcryptjs.compare(refreshToken, existed_token.token);
        if (!bcrypt_validation)
            return { EXPIRATION_ERROR: false, IS_VALID_ERROR: true, ITERATIONS_REACHED: false };

        const isMaxIterationsReached =
            existed_token.iterations >= parseInt(REFRESH_TOKEN_MAX_ITERATIONS as string);
        if (isMaxIterationsReached)
            return { EXPIRATION_ERROR: false, IS_VALID_ERROR: false, ITERATIONS_REACHED: true };

        const db_expiration = existed_token.expired_at > new Date();

        const { valid } = await verifyJwt(
            refreshToken,
            JWT_SECRET_KEYS.REFRESH_TOKEN_PUBLIC_KEY,
            HASHING_ALGORITHMS.RS256
        );
        if (!db_expiration || !valid)
            return { EXPIRATION_ERROR: true, IS_VALID_ERROR: false, ITERATIONS_REACHED: false };

        return { EXPIRATION_ERROR: false, IS_VALID_ERROR: false, ITERATIONS_REACHED: false };
    };

    public reissueAccessToken = async ({
        refreshToken,
    }: {
        refreshToken: string;
    }): Promise<refreshTokenReissueResult> => {
        let accessToken: string | null = null;
        const { decoded } = await verifyJwt(
            refreshToken,
            JWT_SECRET_KEYS.REFRESH_TOKEN_PUBLIC_KEY,
            HASHING_ALGORITHMS.RS256
        );

        if (!decoded || !get(decoded, 'session'))
            return { accessToken: null, IS_VALID_ERROR: true };

        const session = await this.sessionRepository.getSession(get(decoded, 'session'));

        if (!session || !session.is_valid) return { accessToken: null, IS_VALID_ERROR: true };

        const user = await this.userRepository.findUserByEmail(get(decoded, 'email'));

        if (!user) return { accessToken: null, IS_VALID_ERROR: true };

        // find user valid refresh tokens
        const TOKEN = await this.findRefreshTokensByUserIdAndOther({
            userId: user.id,
            is_valid: true,
        });

        if (!TOKEN) return { accessToken: null, IS_VALID_ERROR: true };

        // checking the validity of the refresh token (expiration, iterations, validations)
        const { EXPIRATION_ERROR, ITERATIONS_REACHED, IS_VALID_ERROR } =
            await this.checkRefreshTokenValidity({ tokenId: TOKEN.id, refreshToken });

        if (EXPIRATION_ERROR || ITERATIONS_REACHED || IS_VALID_ERROR) {
            // invalidate all refresh tokens of the user and invalidate the session
            await this.invalidateRefreshToken({ tokenId: TOKEN.id });
            // invalidate user session
            await this.sessionRepository.updateSession(user.id, false);

            if (EXPIRATION_ERROR) return { accessToken: null, EXPIRATION_ERROR: true };
            if (ITERATIONS_REACHED) return { accessToken: null, ITERATIONS_REACHED: true };
            if (IS_VALID_ERROR) return { accessToken: null, IS_VALID_ERROR: true };
        }

        accessToken = await signJwt(
            { ...user, session: session.id },
            JWT_SECRET_KEYS.ACCESS_TOKEN_PRIVATE_KEY,
            HASHING_ALGORITHMS.RS256,
            { expiresIn: parseInt(ACCESSTOKENTTL as string) }
        );
        // update refresh token iterations
        await this.findAndUpdateRefreshTokenIterations({ tokenId: TOKEN.id });

        return { accessToken };
    };
}

export default refreshTokenRepository;
