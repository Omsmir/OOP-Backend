import { TOKEN_INVALIDATION_ERROR_MESSAGE } from './permissions';

export type signRefreshAndAccessTokenProps = {
    userId: string;
    sessionId: string;
    first_time: boolean;
};
export type findRefreshTokenByIdProps = {
    tokenId: string;
};

export type hashAndStoreRefreshTokenProps = {
    userId: string;
    token: string;
};

export type findRefreshTokensByUserIdProps = {
    userId: string;
    is_valid: boolean;
};

export type checkRefreshTokenValidityProps<T = string> = {
    tokenId: T;
    refreshToken: string;
};

export type findAndUpdateRefreshTokenReplacedByProps = {
    tokenId: string;
    newToken: string;
};

export type TVALID<T = boolean, E = string> = {
    EXPIRATION_ERROR?: T;
    IS_VALID_ERROR?: E;
    ITERATIONS_REACHED?: T;
};

export type TOKEN_INVALID_ERROR<T = boolean, E = string> = {
    IS_INVALID: T;
    error: E;
};

export type refreshTokenReissueResult = {
    accessToken: string | null;
    EXPIRATION_ERROR?: boolean;
    IS_VALID_ERROR?: TOKEN_INVALID_ERROR<boolean, TOKEN_INVALIDATION_ERROR_MESSAGE>;
    ITERATIONS_REACHED?: boolean;
};
