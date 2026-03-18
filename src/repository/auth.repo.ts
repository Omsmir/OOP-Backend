import { SALTWORKFACTOR } from '@/config/defaults';
import { PostgresInterface } from '@/interfaces/global.interface';
import { profilePicture, UserInterface, UserToCreate } from '@/interfaces/models.interface';
import bcryptjs from 'bcryptjs';
import { keys, omit, values } from 'lodash';
import { object } from 'zod/v4';

class UserRepository {
    constructor(private readonly DB: PostgresInterface) {}

    public findUserByEmail = async (filter: string): Promise<UserInterface | null> => {
        const query = `SELECT * FROM users WHERE email = $1 LIMIT 1`;
        const result = await this.DB.query(query, [filter]);

        if (!result.rowCount) return null;

        const user = omit(result.rows[0], 'password');

        return user as UserInterface;
    };

    public findUserById = async ({ id }: { id: string }): Promise<UserInterface | null> => {
        const query = `SELECT * FROM users WHERE id = $1 LIMIT 1`;
        const result = await this.DB.query(query, [id]);

        if (!result.rowCount) return null;

        const user = omit(result.rows[0], 'password');

        return user as UserInterface;
    };

    public getAllUsers = async (id: string): Promise<UserInterface[] | null> => {
        const query = `SELECT * FROM users WHERE id != $1`;

        const result = await this.DB.query(query, [id]);

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
        const query = `INSERT INTO users (name,email,password,gender,age,role,permissions,bio) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`;

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
            payload.bio || null,
        ]);

        const createdUser = omit(res.rows[0], 'password');
        return createdUser;
    };

    public UpdateProfilePicture = async (id: string, profile_picture: profilePicture | null) => {
        const query = `UPDATE users SET profile_picture = $1 WHERE id = $2 RETURNING *`;

        const res = await this.DB.query(query, [JSON.stringify(profile_picture), id]);

        if (res.rowCount === 0) return null;

        const updated_user = omit(res.rows[0], 'password') as UserInterface;

        return updated_user;
    };

    public updateUser = async (id: string, updatedFields: Partial<UserToCreate>) => {
        let query = 'UPDATE users SET ';
        const key_value: Record<string, unknown> = {};

        Object.entries(updatedFields).forEach(([key, value], index) => {
            if (!value || value === undefined || value === null || value === '') {
                delete updatedFields[key as keyof UserToCreate];
            }
            if (value) key_value[key] = value;
        });

        Object.entries(key_value).forEach(([key, _], index) => {
            query += `${key} = $${index + 1} ${index + 1 < keys(key_value).length ? ',' : ''} `;
        });

        query += ` WHERE id = $${keys(key_value).length + 1} RETURNING *`;

        const res = await this.DB.query(query, [...Object.values(key_value), id]);

        if (res.rowCount === 0) return null;

        const updated_user = omit(res.rows[0], 'password') as UserInterface;

        return updated_user;
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
