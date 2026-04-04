import { PERMISSIONS, TOKEN_INVALIDATION_ERROR_MESSAGE } from '@/interfaces/permissions';

declare type Nullable<T> = T | null;

declare type Optional<T> = T | undefined;

declare type Maybe<T> = T | null | undefined;

declare type generic<T> = {
    success: boolean;
    data: T;
};

declare type role = 'admin' | 'user' | 'guest';

declare type User = {
    id: string;
    full_name: string;
    age: number;
    role: role;
    permissions: PERMISSIONS[];
    created_at: Date;
    updated_at: Date;
};

// default string generic type
declare type defaultGeneric<T = string> = {
    success: boolean;
    data: T;
};

// constraints

declare type base = { id: string };

// generic interfaces

declare interface Repository<T> {
    create(item: T): Promise<T>;
    findById(id: string): Promise<T | null>;
}

// REAL GENERIC EXAMPLE

declare type UserError = 'User not found' | 'User already exists';

declare type TOKEN_EXPIRATION_MESSAGE = 'Refresh Token Has Expired ' | '';

declare type TOKEN_INVALIDATION_MESSAGE = TOKEN_INVALIDATION_ERROR_MESSAGE;

declare type TOKEN_MAX_ITER_MESSAGE = 'Refresh Token Max Rotations Has Been Reached';
type success<T> = { success: true; data: T };

type failure<E> = { success: false; error: E };

declare type result<T, E = string> = success<T> | failure<E>;



