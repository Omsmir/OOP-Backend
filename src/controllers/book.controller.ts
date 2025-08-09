import { BaseController } from './base.controller';
import { BookSchemaInterface, getBookSchemaInterface } from '@/schemas/book.schema';
import { Request, Response } from 'express';
import BookService from '@/services/book.service';
import HttpException from '@/exceptions/httpException';
import { UserFactory } from '@/classes/creationalPatterns';
class BookController extends BaseController {
    private bookService: BookService;
    constructor() {
        super();
        this.bookService = new BookService();
    }

    public getBooksHandler = async (req: Request, res: Response) => {
        try {
            const books = await this.bookService.GetAllBooks({});

            if (!books) {
                throw new HttpException(404, 'No books found');
            }

            res.status(200).json({ message: 'Books retrieved successfully', books });
        } catch (error) {
            this.handleError(res, error);
        }
    };

    public CreateBookHandler = async (
        req: Request<{}, {}, BookSchemaInterface['body']>,
        res: Response
    ) => {
        try {
            const title = req.body.title;

            const body = {
                quantity: parseInt(req.body.quantity),
                price: parseInt(req.body.price),
            };

            const existedBook = await this.bookService.GetBook({ title });

            if (existedBook) {
                const updatedBook = await this.bookService.UpdateBook(
                    { title },
                    {
                        quantity: existedBook.quantity + body.quantity,
                        price: body.price,
                    },
                    { runValidators: true, new: true }
                );

                res.status(201).json({
                    message: `book with title: ${title} has been updated with quantity:${body.quantity} and price : ${body.price}`,
                    updatedBook,
                });
                return;
            }

            const newBook = await this.bookService.CreateBook({ title, ...body });

            res.status(201).json({ message: `new book has been added`, newBook });
        } catch (error) {
            this.handleError(res, error);
        }
    };

    public BorrowBookHandler = async (
        req: Request<{}, {}, {}, getBookSchemaInterface['query']>,
        res: Response
    ) => {
        try {
            const title = req.query.title;

            const book = await this.bookService.GetBook({ title, quantity: 1 });

            if (book) {
                throw new HttpException(403, `this book is already borrowed by another reader`);
            }
            await this.bookService.UpdateBook(
                { title },
                { borrowed: true },
                { runValidators: true, new: true }
            );

            res.status(200).json({ message: 'this book is borrowed by you' });
        } catch (error) {
            this.handleError(res, error);
        }
    };

    public DeleteBookHandler = async (
        req: Request<{}, {}, {}, getBookSchemaInterface['query']>,
        res: Response
    ) => {
        try {
            const title = req.query.title;

            const book = await this.bookService.GetBook({ title });

            if (!book) {
                throw new HttpException(
                    403,
                    `this book is already borrowed by a reader and can't be deleted right now`
                );
            }
            await this.bookService.DeleteBook({ title });

            res.status(200).json({ message: 'book deleted successfully' });
        } catch (error) {
            this.handleError(res, error);
        }
    };
}

export default BookController;
