import jwt from 'jsonwebtoken';
import config from '@/config/defaults';
import { HASHING_ALGORITHMS, JWT_SECRET_KEYS } from '@/interfaces/permissions';

export const signJwt = async (
    object: object,
    keyNameIdentifier: JWT_SECRET_KEYS,
    KeyEncryption: HASHING_ALGORITHMS, // Ensure this matches supported algorithms
    options?: jwt.SignOptions | undefined
) => {
    if (!['HS512', 'RS256'].includes(KeyEncryption)) {
        throw new Error(
            `Invalid KeyEncryption algorithm provided: ${KeyEncryption}. Supported algorithms are "HS512" and "RS256".`
        );
    }

    const rawKey = config[keyNameIdentifier as keyof typeof config] as string;

    const signingKey =
        KeyEncryption === 'HS512'
            ? rawKey // use plain string or .env variable
            : Buffer.from(rawKey, 'base64').toString('ascii'); // for RS256 (PEM base64)

    return jwt.sign(object, signingKey, {
        ...(options && options),
        algorithm: KeyEncryption, // Default to RS256 if not specified
    });
};

export const verifyJwt = async (
    token: string,
    keyNameIdentifier: JWT_SECRET_KEYS,
    KeyEncryption: HASHING_ALGORITHMS
) => {
    try {
        const publicKey =
            KeyEncryption === 'HS512'
                ? (config[keyNameIdentifier as keyof typeof config] as string)
                : Buffer.from(
                      config[keyNameIdentifier as keyof typeof config] as string,
                      'base64'
                  ).toString('ascii');

        const decoded = jwt.verify(token, publicKey);

        return {
            valid: true,
            expired: false,
            decoded,
        };
    } catch (error: any) {
        return {
            valid: false,
            expired: (error.message = 'jwt expired'),
            decoded: null,
        };
    }
};
