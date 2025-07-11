import { BookInput } from '@/interfaces/models.interface';
import { Document, model, Schema } from 'mongoose';

export interface BookDocument extends BookInput, Document {
    createdAt: Date;
    updatedAt: Date;
}

const BookSchema = new Schema<BookDocument>(
    {
        title: { type: String, required: true },
        quantity: { type: Number, required: true },
        borrowed: { type: Boolean, default: false },
        price: { type: Number, required: true },
    },
    {
        timestamps: true,
    }
);

const BookModel = model<BookDocument>('books', BookSchema);

export default BookModel;
