import BookController from '@/controllers/book.controller';
import { routes } from '@/interfaces/routes.interface';
import upload from '@/middlewares/multer';
import { validate } from '@/middlewares/validateResource';
import { BookSchema, getBookSchema } from '@/schemas/book.schema';
import { Request, Response, Router } from 'express';

class BookRoute implements routes {
    public path = '/books';
    public router = Router();
    private bookController: BookController;
    constructor() {
        this.bookController = new BookController();
        this.initializeRoute();
    }

    private initializeRoute() {
        this.router.post(
            this.path,
            upload.none(),
            validate(BookSchema),
            this.bookController.CreateBookHandler
        );
        this.router.put(this.path, validate(getBookSchema), this.bookController.BorrowBookHandler);

        this.router.delete(this.path,validate(getBookSchema),this.bookController.DeleteBookHandler)
    }
}

export default BookRoute;
