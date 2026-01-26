import { SALTWORKFACTOR } from '@/config/defaults';
import bcrypt from 'bcryptjs';

export const hashing_password = (password: string): string => {
    const hashed = bcrypt.hashSync(password, Number(SALTWORKFACTOR));

    return hashed;
};
