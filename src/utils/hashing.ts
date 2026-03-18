import { SALTWORKFACTOR } from '@/config/defaults';
import bcrypt from 'bcryptjs';

export const hashing_password = async (password: string) => {
    const salt = await bcrypt.genSalt(parseInt(SALTWORKFACTOR as string));

    const hashed = bcrypt.hashSync(password, salt);

    return hashed;
};
