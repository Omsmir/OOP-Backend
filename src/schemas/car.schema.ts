import { z } from 'zod';

const payload = {
    body: z.object({
        name: z
            .string({
                error: 'Car name is required',
            })
            .min(1, 'Car name cannot be empty'),

        type: z
            .string({
                error: 'Car type is required',
            })
            .min(1, 'Car type cannot be empty'),

        color: z
            .string({
                error: 'Car color is required',
            })
            .min(1, 'Car color cannot be empty'),

        price: z.string({ error: 'car price is required' }).min(1),

        seats: z.string().optional(),
    }),
};

const updatePayload = {
    body: z.object({
        name: z.string().optional(),
        type: z.string().optional(),
        color: z.string().optional(),

        price: z.string({ error: 'at least price needed for editing' }),

        seats: z.string().optional(),
    }),
};
const params = {
    params: z.object({
        id: z.string({ error: 'car id is required' }),
    }),
};

export const carSchema = z.object({
    ...payload,
});

export const getCarSchema = z.object({
    ...params,
});

export const deleteCarSchema = z.object({
    ...params,
});

export const updateCarSchema = z.object({
    ...params,
    ...updatePayload,
});
export type carSchemaInterface = z.infer<typeof carSchema>;
export type getCarSchemaInterface = z.infer<typeof getCarSchema>;
export type deleteCarSchemaInterface = z.infer<typeof deleteCarSchema>;

export type UpdateCarSchemaInterface = z.infer<typeof updateCarSchema>;
