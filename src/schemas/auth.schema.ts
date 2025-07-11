import { z } from 'zod';

const payload = {
    body: z.object({
        name: z.string({ required_error: 'name is required' }),
        email: z
            .string({ required_error: 'email is required' })
            .email({ message: 'not a vaild email' }),
        password: z.string({ required_error: 'password is required' }),
        role: z.enum(['admin', 'user', 'guest'], { required_error: 'role is required' }),
    }),
};

const deletePayload = {
    body: z.object({
        userId: z.string({ required_error: 'user is is required' }),
    }),
};

const updatePayload = {
    body: z.object({
        userId: z.string({ required_error: 'userId is required' }),
        role: z.enum(['admin', 'user', 'guest'], { required_error: 'role is required' }),
    }),
};

const params = {
    params: z.object({
        id: z.string({ required_error: 'user id is required' }),
    }),
};

export const createUserSchema = z.object({
    ...params,
    ...payload,
});

export const deleteUserSchema = z.object({
    ...params,
    ...deletePayload,
});

export const updateUserSchema = z.object({
    ...params,
    ...updatePayload,
});

export type createUserSchemaInterface = z.infer<typeof createUserSchema>;
export type deleteUserSchemaInterface = z.infer<typeof deleteUserSchema>;
export type updateUserSchemaInterface = z.infer<typeof updateUserSchema>;
