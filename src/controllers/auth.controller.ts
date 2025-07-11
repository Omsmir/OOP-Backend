import UserService from '@/services/auth.service';
import { BaseController } from './base.controller';
import HttpException from '@/exceptions/httpException';
import { Request, Response } from 'express';
import {
    createUserSchemaInterface,
    deleteUserSchemaInterface,
    updateUserSchemaInterface,
} from '@/schemas/auth.schema';
import { UserFactory } from '@/classes/creationalPatterns';
import { EmailUtils } from '@/utils/send.email';
import { CommandInvoker, EventBus, LoggerSubscriber } from '@/classes/behavioral.class';

class UserController extends BaseController {
    private userService: UserService;
    private userFactory = UserFactory; // factory design pattern usage
    private invoker: CommandInvoker;
    private sub: EventBus = new EventBus();
    constructor() {
        super();
        this.userService = new UserService();
        this.invoker = new CommandInvoker(); // command behavoiral pattern invoker
        this.sub.subcribe(new LoggerSubscriber()); // observer behavoiral pattern subscriber
    }

    public createUserHandler = async (
        req: Request<createUserSchemaInterface['params'], {}, createUserSchemaInterface['body']>,
        res: Response
    ) => {
        try {
            const id = req.params.id;

            const adminUser = await this.userService.findUser({
                _id: id,
                permissions: { $in: ['write'] },
            });

            if (!adminUser || (adminUser.role !== 'admin' && req.body.role === 'admin')) {
                throw new HttpException(403, 'there are no suffient priviliages');
            }

            const existedUser = await this.userService.findUser({ email: req.body.email });

            if (existedUser) {
                throw new HttpException(
                    403,
                    `user with email:${existedUser.email} is already exist`
                );
            }

            const createdUserInstance = this.userFactory.create(req.body.role); // factory design pattern usage

            if (!createdUserInstance) {
                throw new HttpException(400, 'error creating user instance');
            }

            const user = {
                ...req.body,
                role: createdUserInstance.role as 'admin' | 'user' | 'guest', // factory design pattern usage
                permissions: createdUserInstance.permessions(), // factory design pattern usage
            };

            const createdUser = await this.userService.createUser(user);

            if (!createdUser) {
                throw new HttpException(400, 'error creaing user');
            }

            this.sub.notify(`new user with name: ${createdUser.name} has been created`)
            res.status(201).json({ message: 'user created successfully', createdUser });
        } catch (error) {
            this.handleError(res, error);
        }
    };

    public updateUserHandler = async (
        req: Request<updateUserSchemaInterface['params'], {}, updateUserSchemaInterface['body']>,
        res: Response
    ) => {
        try {
            const id = req.params.id;
            const userId = req.body.userId;

            if (userId === id) {
                throw new HttpException(403, "user can't give privilages to itself");
            }
            const adminUser = await this.userService.findUser({
                _id: id,
                permissions: { $in: ['update'] },
            });

            if (!adminUser) {
                throw new HttpException(403, 'there are no suffient priviliages');
            }

            const existedUser = await this.userService.findUser({ _id: userId });

            if (!existedUser) {
                throw new HttpException(404, `user with id:${userId} is not found`);
            }

            const updatedUserInstance = this.userFactory.create(req.body.role);

            if (!updatedUserInstance) {
                throw new HttpException(400, 'error creating user instance');
            }

            const user = {
                role: updatedUserInstance.role as 'admin' | 'user' | 'guest', // factory design pattern usage
                permissions: updatedUserInstance.permessions(), // factory design pattern usage
            };

            const updatedUser = await this.userService.updateUser({ _id: userId }, user, {
                runValidators: true,
                new: true,
            });

            if (!updatedUser) {
                throw new HttpException(400, 'error updating user');
            }

            res.status(200).json({ message: 'user has been updated successfully', updatedUser });
        } catch (error) {
            this.handleError(res, error);
        }
    };

    public deleteUserHandler = async (
        req: Request<deleteUserSchemaInterface['params'], {}, deleteUserSchemaInterface['body']>,
        res: Response
    ) => {
        try {
            const id = req.params.id;
            const userId = req.body.userId;

            if (userId === id) {
                throw new HttpException(403, "user can't delete himself");
            }
            const adminUser = await this.userService.findUser({
                _id: id,
                permissions: { $in: ['delete'] },
            });

            if (!adminUser) {
                throw new HttpException(403, 'there are no suffient priviliages');
            }

            const user = await this.userService.deleteUser({ _id: userId });

            if (!user) {
                throw new HttpException(404, `user with id:${userId} is not found`);
            }

            await this.userService.deleteUser({ _id: userId });
            res.status(200).json({ message: 'user has been deleted successfully' });
        } catch (error) {
            this.handleError(res, error);
        }
    };

    public sendVerficationEmailToUnverifiedUsers = async (req: Request, res: Response) => {
        try {
            const unverifiedUsers = await this.userService.getAllUsers({ verified: false });

            if (!unverifiedUsers) {
                throw new HttpException(404, 'no unverified users found');
            }

            for (const user of unverifiedUsers) {
                this.invoker.addCommand(
                    // command behavoiral pattern
                    new EmailUtils({
                        to: user.email,
                        templateName: 'emailVerification.hbs',
                        link: 'http://localhost:8090/api', // change it to real verification email link value
                        appName: 'OOP',
                        year: new Date().getFullYear(),
                    })
                ); // now we have added a commands to the invoker queue, let's execute the commands
            }

            // this.invoker.getCommands() // only to witness the command process
            this.invoker.run(); // the console shows the logging messages for sending emails in an asynchronous way

            res.status(200).json({
                message: 'email verifications have been sent to unverified users',
            });
        } catch (error) {
            this.handleError(res, error);
        }
    };
}

export default UserController;
