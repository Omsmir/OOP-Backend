import { CarInput } from '@/interfaces/models.interface';
import CarModel, { CarDocument } from '@/models/car.model';
import { FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';

// SOLID principles interpreted

// All the route Class is a single responsability
class CarService {
    constructor(private carModel = CarModel) {
        // dependency injection: composition over inheritance
    }

    public async createCar(input: CarInput): Promise<CarDocument> {
        return await this.carModel.create(input);
    }

    public async getCar(query: FilterQuery<CarDocument>): Promise<CarDocument | null> {
        return await this.carModel.findOne(query);
    }

    public async getAllCars(query: FilterQuery<CarDocument>) {
        return await this.carModel.find(query);
    }

    public async editCar(
        query: FilterQuery<CarDocument>,
        update: UpdateQuery<CarDocument>,
        options?: QueryOptions
    ) {
        return await this.carModel.findOneAndUpdate(query, update, options);
    }

    public async deleteCar(query: FilterQuery<CarDocument>) {
        return await this.carModel.deleteOne(query);
    }
}

export default CarService;
