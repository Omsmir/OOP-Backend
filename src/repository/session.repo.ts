import { PostgresInterface } from '@/interfaces/global.interface';
import { session, sessionToCreate } from '@/interfaces/models.interface';
import { signJwt, verifyJwt } from '@/utils/jwt.sign';
import { get } from 'lodash';
import { ACCESSTOKENTTL } from '@/config/defaults';
import UserRepository from './auth.repo';

class sessionRepository {
    private readonly userRepository: UserRepository;
    constructor(private readonly DB: PostgresInterface) {
        this.userRepository = new UserRepository(this.DB);
    }

    public createSession = async (session: sessionToCreate): Promise<session | null> => {
        const query = `INSERT INTO sessions (user_id,user_agent) VALUES ($1,$2) RETURNING *`;

        const result = await this.DB.query(query, [session.user_id, session.user_agent]);

        if (result.rowCount === 0) return null;

        return result.rows[0] as session;
    };

    public getSession = async (user_id: string): Promise<session | undefined> => {
        const query = `SELECT * FROM sessions WHERE id = $1 AND is_valid = true LIMIT 1`;

        const result = await this.DB.query(query, [user_id]);

        if (result.rowCount === 0) return undefined;

        return result.rows[0] as session;
    };

    public updateSession = async (user_id: string, is_valid: boolean) => {
        const query = `UPDATE sessions SET is_valid = $1 WHERE user_id = $2`;

        const result = await this.DB.query(query, [is_valid, user_id]);

        if (result.rowCount === 0) return undefined;

        return result.rows[0];
    };

    public reIssueAccessToken = async (refreshToken: string) => {
        const { decoded } = await verifyJwt(refreshToken, 'refreshTokenPublicKey', 'RS256');

        if (!decoded || !get(decoded, 'session')) return false;

        const session = await this.getSession(get(decoded, 'session'));

        console.log("session",session)

        if (!session || !session.is_valid) return false;

        const user = await this.userRepository.findUserByEmail(get(decoded, 'email'));

        if (!user) return false;

        const accessToken = signJwt(
            { ...user, session: session.id },
            'accessTokenPrivateKey',
            'RS256',
            { expiresIn: parseInt(ACCESSTOKENTTL as string) }
        );

        return accessToken;
    };
}

export default sessionRepository;
