import HttpException from '@/exceptions/httpException';
import { carSchemaInterface, getCarSchemaInterface } from '@/schemas/car.schema';
import CarService from '@/services/car.service';
import { Request, Response } from 'express';
import { BaseController } from './base.controller';
class CarController extends BaseController {
    private carService: CarService;
    constructor() {
        super();
        this.carService = new CarService();
    }

    public createCarHandler = async (
        req: Request<{}, {}, carSchemaInterface['body']>,
        res: Response
    ) => {
        try {
            const name = req.body.name;
            const type = req.body.type;
            const price = req.body.price;

            const existedCar = await this.carService.getCar({ name, type });

            if (existedCar) {
                throw new HttpException(
                    403,
                    `car with name:${name} and type:${type} already exists`
                );
            }

            const newCar = await this.carService.createCar({ ...req.body, price: parseInt(price) });

            res.status(201).json({ message: 'new car has been created successfully', newCar });
        } catch (error: any) {
            this.handleError(res, error);
        }
    };

    public getCarController = async (
        req: Request<getCarSchemaInterface['params']>,
        res: Response
    ) => {
        try {
            const carId = req.params.id;

            const car = await this.carService.getCar({ _id: carId });

            if (!car) {
                throw new HttpException(404, `car with id: ${carId} is not found`);
            }
            res.status(200).json({ message: 'success', car });
        } catch (error) {
            this.handleError(res, error);
        }
    };
}

export default CarController;
