import BookController from '@/controllers/book.controller';
import { routes } from '@/interfaces/routes.interface';
import upload from '@/middlewares/multer';
import { validate } from '@/middlewares/validateResource';
import { BookSchema, getBookSchema } from '@/schemas/book.schema';
import { Router } from 'express';
import BaseRoute from './base.route';

// SOLID principles interpreted

// All the route Class is a single responsability
// interface segregation && liskov substitbution
class BookRoute extends BaseRoute {
    private bookController: BookController; // composition over inheritance

    constructor() {
        super('/books');
        this.bookController = new BookController();
        this.initializeRoutes();
    }

    protected initializeRoutes() {
        this.router.get(this.path, this.bookController.getBooksHandler);
        this.router.post(
            this.path,
            upload.none(),
            validate(BookSchema),
            this.bookController.CreateBookHandler
        );
        this.router.put(this.path, validate(getBookSchema), this.bookController.BorrowBookHandler);

        this.router.delete(
            this.path,
            validate(getBookSchema),
            this.bookController.DeleteBookHandler
        );
    }
}

export default BookRoute;
