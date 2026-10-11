import { PERMISSIONS } from '@/interfaces/permissions';
import { base, defaultGeneric, generic, Maybe, Repository, result, User, UserError } from '.';
import { logger } from '@/utils/logger';

class Generics {
    private static instance: Generics;
    private users: User[];
    constructor() {
        this.users = [];
    }

    public static getInstance(): Generics {
        if (!Generics.instance) {
            Generics.instance = new Generics();
        }
        return Generics.instance;
    }

    public async createUser(user: User): Promise<result<User, UserError>> {
        if (this.users.find((u) => u.id === user.id)) {
            return {
                success: false,
                error: 'User already exists',
            };
        }
        this.users.push(user);
        return {
            success: true,
            data: user,
        };
    }

    public async getUserById(id: string): Promise<result<User, UserError>> {
        const user = this.users.find((u) => u.id === id);
        if (!user) {
            return {
                success: false,
                error: 'User not found',
            };
        }
        return {
            success: true,
            data: user,
        };
    }
}

// example of generic type with type injection
const userCreated: generic<User> = {
    success: true,
    data: {
        id: '123',
        full_name: 'John Doe',
        age: 30,
        role: 'admin',
        permissions: [PERMISSIONS.ROOT_ADMIN],
        created_at: new Date(),
        updated_at: new Date(),
    },
};

// object with generic type
const getObjectKey = <T, K extends keyof T>(obj: T, key: K): T[K] | undefined => {
    if (obj[key] !== undefined) {
        return obj[key];
    }
    return undefined;
};

// console.log(getObjectKey(userCreated.data, 'full_name')); // Output: John Doe
// console.log(getObjectKey(userCreated.data,'age'))
// console.log(getObjectKey(userCreated.data,'permissions'))

const DefaultGeneric: defaultGeneric = {
    success: true,
    data: 'This is a string with default generic type',
};

// generic with constraints

const getId = <T extends base>(obj: T): T => {
    return obj;
};

// console.log(getId({ id: '1', age: 22 })); // all data is now in the output but we can access the id directly with type inference

// GENERICS WITH ARRAYS

const first = <T>(arr: T[]): T => {
    return arr[0];
};

// console.log(first([1,2,3])); // Output: 1
// console.log(first(['a','b','c']));
// console.log(first([])) // never

let name: Maybe<string> = null; // this can be string or null or undefined

name = 'omar';

const userRepository = async <T>(id: string) => {
    const generics = Generics.getInstance();

    await generics.createUser({ ...userCreated.data });

    const user = await generics.getUserById(id);

    if (user.success) {
        logger.warn(`User found: ${user.data.full_name}`);
    } else {
        logger.error(user.error);
    }
};

// userRepository<string>('123'); // User found: John Doe
// userRepository('456'); // User not found

export default Generics;
