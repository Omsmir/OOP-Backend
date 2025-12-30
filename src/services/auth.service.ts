import { FilterQuery, QueryOptions, SchemaTypeOptions, UpdateQuery } from 'mongoose';
import UserModel, { UserDocument } from '@/models/auth.model';
import { omit } from 'lodash';
import { UserInput } from '@/interfaces/models.interface';
import bcryptjs from 'bcryptjs';
// SOLID principles interpreted

// All the route Class is a single responsability
class UserService {
    // dependency injection: composition over inheritance
    constructor(private userModel = UserModel) {}

    public createUser = async (input: UserInput) => {
        const user = await this.userModel.create(input);

        return omit(user.toJSON(), 'password');
    };

    public updateUser = async (
        query: FilterQuery<UserDocument>,
        update: UpdateQuery<UserDocument>,
        options?: QueryOptions
    ) => {
        return await this.userModel.findOneAndUpdate(query, update, options);
    };

    public findUser = async (query: FilterQuery<UserDocument>) => {
        return await this.userModel.findOne(query).lean();
    };
    public getAllUsers = async (query?: FilterQuery<UserDocument>) => {
        return await this.userModel.find(query ? query : {});
    };
    public deleteUser = async (query: FilterQuery<UserDocument>) => {
        return await this.userModel.findOneAndDelete(query);
    };

    public validatePassword = async ({ email, password }: { email: string; password: string }) => {
        try {
            const user = await this.findUser({ email });

            if (!user) {
                return false;
            }


            const isValid = await bcryptjs.compare(password, (user as UserDocument).password);

            if (!isValid) {
                return false;
            }

            return user
        } catch (error: any) {
            throw new Error(`validate service error ${error.message}`);
        }
    };
}

export default UserService;
