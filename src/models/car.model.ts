import { CarInput } from '@/interfaces/models.interface';
import { Document, model, Schema } from 'mongoose';

export interface CarDocument extends CarInput, Document {
    createdAt: Date;
    updatedAt: Date;
}

const CarSchema = new Schema<CarDocument>(
    {
        name: { type: String, required: true },
        type: { type: String, required: true },
        color: { type: String, required: true },
        used: { type: Boolean, default: false },
        price: { type: Number, required: true },
        seats: { type: String, default: 4 },
    },
    {
        timestamps: true,
    }
);

const CarModel = model<CarDocument>('car', CarSchema);

export default CarModel;
