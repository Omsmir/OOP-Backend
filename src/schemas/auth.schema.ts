import { EMAIL_TEMPLATES, SUBJECT_TYPES } from '@/interfaces/global.interface';
import { z } from 'zod';
const validImageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];

const payload = {
    body: z.object({
        name: z.string({ required_error: 'name is required' }),
        email: z.string({ required_error: 'email is required' }).email({ message: 'not a vaild email' }),
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

const createUserPayload = {
    body: z.object({
        name: z.string({ required_error: 'name is required' }),
        email: z.string({ required_error: 'email is required' }).email({ message: 'not a valid email' }),
        password: z.string({ required_error: 'password is required' }),
        age: z.string({ required_error: 'age is required' }),
        role: z.enum(['admin', 'user', 'guest'], { required_error: 'role is required' }),
        gender: z.enum(['male', 'female', 'other'], { required_error: 'please select a gender' }),
    }),
};

const updateUserPayload = {
    body: z.object({
        name: z.string().optional(),
        gender: z.enum(['male', 'female', 'other']).optional(),
        bio: z.string().optional(),
        age: z.string().optional(),
    }),
    file: z
        .object({
            profileImg: z
                .custom<Express.Multer.File | undefined>((file) => file !== undefined && file !== null, {
                    message: 'please select a profile picture',
                })
                .refine(
                    (file) => {
                        if (!file) return false;
                        const fileName = file.originalname.toLowerCase();
                        const extension = fileName.split('.').pop();
                        return validImageExtensions.includes(extension || '');
                    },
                    { message: 'Invalid image extension' }
                ),
        })
        .optional(),
};

const sendEmailPayload = {
    body: z.object({
        email: z.string({ required_error: 'please support the email of the recipient' }).email(),
    }),
    query: z.object({
        template_name: z.enum(Object.values(EMAIL_TEMPLATES) as [string, ...string[]]),
        subject: z.enum(Object.values(SUBJECT_TYPES) as [string, ...string[]]),
    }),
};

export enum CHANGE_KEY_QUERY {
    PROFILE_PICTURE = 'PROFILE_PICTURE',
    PROFILEANDOTHER = 'PROFILEANDOTHER',
    OTHER = 'OTHER',
}

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

export const createUserSchemaForPostgres = z.object({
    ...createUserPayload,
});

export const getAllUserForPostGresSchema = z.object({
    ...params,
});

export const updateUserSchemaForPostgres = z.object({
    ...params,
    ...updateUserPayload,
});

export const sendEmailSchema = z.object({
    ...params,
    ...sendEmailPayload,
});

export type createUserSchemaInterface = z.infer<typeof createUserSchema>;
export type deleteUserSchemaInterface = z.infer<typeof deleteUserSchema>;
export type updateUserSchemaInterface = z.infer<typeof updateUserSchema>;
export type createUserSchemaForPostgresInterface = z.infer<typeof createUserSchemaForPostgres>;
export type getAllUserForPostGresSchemaInterface = z.infer<typeof getAllUserForPostGresSchema>;
export type updateUserSchemaForPostgresInterface = z.infer<typeof updateUserSchemaForPostgres>;
export type sendEmailSchemaInterface = z.infer<typeof sendEmailSchema>;
