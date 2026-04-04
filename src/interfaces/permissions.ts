export enum PERMISSIONS {
    USER_CREATE = 'USER:CREATE',
    USER_READ = 'USER:READ',
    USER_UPDATE = 'USER:UPDATE',
    USER_DELETE = 'USER:DELETE',

    USER_PROFILE_UPDATE = 'USER_PROFILE:UPDATE',

    ROOT_ADMIN = 'ROOT:ADMIN',
    EMAIL_SENDING = 'USER:EMAIL_SENDING'
}

export enum HASHING_ALGORITHMS {
    RS256 = 'RS256',
    HS512 = 'HS512',
}

export enum JWT_SECRET_KEYS {
    ACCESS_TOKEN_PRIVATE_KEY = 'accessTokenPrivateKey',
    ACCESS_TOKEN_PUBLIC_KEY = 'accessTokenPublicKey',
    REFRESH_TOKEN_PRIVATE_KEY = 'refreshTokenPrivateKey',
    REFRESH_TOKEN_PUBLIC_KEY = 'refreshTokenPublicKey',
    VERIFICATION_TOKEN = 'VERIFICATION_TOKEN',
}

export enum TOKEN_INVALIDATION_ERROR_MESSAGE {
    REFRESH_EXPIRED = 'Refresh Token Has Expired or Not Found',
    HASHING_ERROR = 'Refresh Token Hashing Error',
    SESSION_ERROR = 'Session Is Invalid or Has Been Expired',
    USER_ERROR = 'User Is Not Found or Something Went Wrong',
    NULL = '',
}


