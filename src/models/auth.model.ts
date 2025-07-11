import mongoose, { Document } from 'mongoose';
import bcryptjs from 'bcryptjs';
import { SALTWORKFACTOR } from '@/config/defaults';
import { logger } from '@/utils/logger';
import { UserInput } from '@/interfaces/models.interface';

export interface UserDocument extends UserInput, Document {
    createdAt: Date;
    updatedAt: Date;
    comparePassword: (candidatePassword: string) => Promise<boolean>;
}

const userSchema = new mongoose.Schema<UserDocument>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: {
            type: String,
            required: true,
        },
        verified: { type: Boolean, default: false },
        role: { type: String, enum: ['admin', 'user', 'guest'], required: true },
        permissions: { type: [String], required: true },
    },
    { timestamps: true }
);

userSchema.pre('save', async function (next) {
    const user = this as UserDocument;

    if (user.isModified('password')) {
        try {
            const salt = await bcryptjs.genSalt(parseInt(SALTWORKFACTOR as string));
            const hash = bcryptjs.hashSync(user.password, salt);
            user.password = hash;
        } catch (error: any) {
            logger.error(error.message);
            return next(error);
        }
    }

    next();
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    const user = this as UserDocument;
    return bcryptjs.compare(candidatePassword, user.password).catch((e) => false);
};

const UserModel = mongoose.model('User', userSchema);

export default UserModel;
