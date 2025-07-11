import { UserDocument } from '@/models/auth.model';

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
    verified?:boolean;
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
