import { z } from 'zod';

const payload = {
    body: z.object({
        email: z
            .string({ required_error: 'please write down your email' })
            .email({ message: 'not a vaild email' }),
        password: z.string({ required_error: 'please write down your password' }),
    }),
};

const params = {
    params: z.object({
        id: z.string({ required_error: 'user id is required' }),
    }),
};

export const loginSchema = z.object({
    ...payload,
});

export const logoutSchema = z.object({
    ...params,
});
export type LoginSchemaInterface = z.infer<typeof loginSchema>;
export type logoutSchemaInterface = z.infer<typeof logoutSchema>;