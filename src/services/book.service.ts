import { BookInput } from '@/interfaces/models.interface';
import BookModel, { BookDocument } from '@/models/book.model';
import { FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';

// SOLID principles interpreted

// All the route Class is a single responsability
class BookService {
    constructor(private bookModel = BookModel) {
        // dependency injection: composition over inheritance
    }

    public async CreateBook(input: BookInput): Promise<BookDocument> {
        return await this.bookModel.create(input);
    }

    public async GetAllBooks(query: FilterQuery<BookDocument>) {
        return await this.bookModel.find(query);
    }
    public async GetBook(query: FilterQuery<BookDocument>): Promise<BookDocument | null> {
        return await this.bookModel.findOne(query);
    }
    public async UpdateBook(
        query: FilterQuery<BookDocument>,
        update: UpdateQuery<BookDocument>,
        options?: QueryOptions
    ) {
        return await this.bookModel.findOneAndUpdate(query, update, options);
    }

    public async DeleteBook(query: FilterQuery<BookDocument>) {
        return await this.bookModel.deleteOne(query);
    }
}

export default BookService;
