import type { NextFunction, Request, Response } from 'express';
import * as z from 'zod';

export const validate = (schema: z.ZodType) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const result = schema.safeParse({
            body: req.body,
            params: req.params,
            query: req.query,
            file: req.file ? { profileImg: req.file } : undefined,
        });

        if (!result.success) {
            const errorMessages = result.error.issues.map((issue) => issue.message);

            const responseMessage = errorMessages.length > 1 ? 'More than one field is invalid' : (errorMessages[0] ?? 'Validation failed');

            res.status(400).json({
                message: responseMessage,
                errorMessages,
            });

            return;
        }

        next();
    };
};
