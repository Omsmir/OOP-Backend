import { z } from 'zod';

const payload = {
    body: z.object({
        title: z
            .string({
                required_error: 'book title is required',
                invalid_type_error: 'book title must be a string',
            })
            .min(1, 'book title cannot be empty'),

        price: z.string({ required_error: 'Book price is required' }).min(1),

        quantity: z.string({ required_error: 'Book quantity is required' }).min(1),
    }),
};

const params = {
    params: z.object({
        id: z.string({ required_error: 'user id is required' }),
    }),
};
const querys = {
    query: z.object({
        title: z.string({ required_error: 'Book title is required' }),
    }),
};
export const BookSchema = z.object({
    ...payload,
});

export const getBookSchema = z.object({
    ...querys,
});
export type BookSchemaInterface = z.infer<typeof BookSchema>;
export type getBookSchemaInterface = z.infer<typeof getBookSchema>;
