import { UserDocument } from '@/models/auth.model';
import { PERMISSIONS } from './permissions';

export interface CarInput {
    name: string;
    type: string;
    color: string;
    price: number;
    seats?: string;
    used?: boolean;
}

export interface BookInput {
    title: string;
    price: number;
    borrowed?: boolean;
    quantity: number;
}

export interface UserInput {
    name: string;
    verified?: boolean;
    email: string;
    password: string;
    role: 'admin' | 'user' | 'guest';
    permissions: string[];
}

export interface sessionInput {
    role: 'admin' | 'user' | 'guest';
    user: UserDocument['_id'];
    valid?: boolean;
}

export type profilePicture = {
    url: string;
    name: string;
    content_type: string;
};

export interface UserToCreate {
    name: string;
    email: string;
    password: string;
    age: number;
    role: 'admin' | 'user' | 'guest';
    gender: 'male' | 'female' | 'other';
    bio?: string;
    permissions: PERMISSIONS[];
}

export interface UserInterface {
    id: string;
    name: string;
    email: string;
    age: number;
    role: 'admin' | 'user' | 'guest';
    gender: 'male' | 'female' | 'other';
    permissions: PERMISSIONS[];
    verified: boolean;
    password: string;
    profile_picture?: profilePicture;
    bio: string;
    created_at: Date;
    updated_at: Date;
}

export interface sessionToCreate {
    user_id: string;
    user_agent: string;
}

export interface session {
    id: string;
    user_id: string;
    user_agent: string;
    is_valid: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface RefreshToken {
    id: string;
    user_id: string;
    token: string;
    is_valid: boolean;
    replaced_by: string | null;
    iterations: number;
    created_at: Date;
    updated_at: Date;
    expired_at: Date;
}


export interface refreshTokenInput {
    user_id: string;
    token: string;
    expired_at: Date;
}