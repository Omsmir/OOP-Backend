
export type signRefreshAndAccessTokenProps = {
    userId: string;
    sessionId: string;
    first_time:boolean
}
export type findRefreshTokenByIdProps = {
    tokenId: string;
}

export type hashAndStoreRefreshTokenProps = { 
    userId: string;
    token: string;
}

export type findRefreshTokensByUserIdProps = { 
    userId: string;
    is_valid: boolean;
}


export  type checkRefreshTokenValidityProps = { 
    tokenId:string,
    refreshToken:string
}

export type findAndUpdateRefreshTokenReplacedByProps = {
    tokenId:string;
    newToken:string;
}

export type refreshTokenReissueResult = {
    accessToken: string | null;
    EXPIRATION_ERROR?: boolean;
    IS_VALID_ERROR?: boolean;
    ITERATIONS_REACHED?: boolean;
};


