import { SALTWORKFACTOR } from '@/config/defaults';
import { PostgresInterface } from '@/interfaces/global.interface';
import { UserInterface, UserToCreate } from '@/interfaces/models.interface';
import bcryptjs from 'bcryptjs';
import { omit } from 'lodash';

class UserRepository {
    constructor(private readonly DB: PostgresInterface) {}

    public findUserByEmail = async (filter: string): Promise<UserInterface | null> => {
        const query = `SELECT * FROM users WHERE email = $1 LIMIT 1`;
        const result = await this.DB.query(query, [filter]);

        if (!result.rowCount) return null;

        const user = omit(result.rows[0], 'password');

        return user as UserInterface;
    };

    public getAllUsers = async (id:string): Promise<UserInterface[] | null> => {
        const query = `SELECT * FROM users WHERE id != $1`;

        const result = await this.DB.query(query,[id]);

        if (result.rowCount === 0) return null;

        const users = result.rows.map((user) => omit(user, 'password'));

        return users as UserInterface[];
    };

    public isAdmin = async (email: string): Promise<boolean> => {
        const user = await this.findUserByEmail(email);

        if (!user) return false;

        const isAdmin = user.role === 'admin' ? true : false;
        return isAdmin;
    };
    public createUser = async (payload: UserToCreate) => {
        const query = `INSERT INTO users (name,email,password,gender,age,role,permissions) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`;

        const salt = await bcryptjs.genSalt(parseInt(SALTWORKFACTOR as string));
        
        const hashedPassword = bcryptjs.hashSync(payload.password, salt);

        const res = await this.DB.query(query, [
            payload.name,
            payload.email,
            hashedPassword,
            payload.gender,
            payload.age,
            payload.role,
            payload.permissions,
        ]);

        const createdUser = omit(res.rows[0], 'password');
        return createdUser;
    };

    public getUserById = async (id: string): Promise<UserInterface | undefined> => {
        const query = `SELECT * FROM users WHERE id = $1 LIMIT 1`;

        const result = await this.DB.query(query, [id]);

        if (result.rowCount === 0) return;

        const user = omit(result.rows[0], 'password') as UserInterface;
        return user;
    };

    public validateUser = async (
        email: string,
        password: string
    ): Promise<undefined | UserInterface> => {
        const query = 'SELECT * FROM users WHERE email = $1';

        const result = await this.DB.query(query, [email]);

        if (result.rowCount === 0) return undefined;

        const user = result.rows[0] as UserInterface;

        if (!user) return undefined;

        const isValid = await bcryptjs.compare(password, user.password);

        if (!isValid) return undefined;

        return omit(user, 'password') as UserInterface;
    };
}

export default UserRepository;
