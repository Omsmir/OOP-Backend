import HttpException from '@/exceptions/httpException';
import {
    carSchemaInterface,
    deleteCarSchemaInterface,
    getCarSchemaInterface,
    UpdateCarSchemaInterface,
} from '@/schemas/car.schema';
import CarService from '@/services/car.service';
import { Request, Response } from 'express';
import { BaseController } from './base.controller';
import { EventBus, LoggerSubscriber } from '@/classes/behavioral.class';
class CarController extends BaseController {
    private carService: CarService;
    private subcriber: EventBus = new EventBus()
    constructor() {
        super();
        this.carService = new CarService();
        this.subcriber = new EventBus();
        this.subcriber.subcribe(new LoggerSubscriber()) // observer behavoiral pattern subscriber
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

            this.subcriber.notify(`car with id ${newCar.id} has been created`); // we have subcribed for event of successfully creating car

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

    public updateCarHandler = async (
        req: Request<UpdateCarSchemaInterface['params'], {}, UpdateCarSchemaInterface['body']>,
        res: Response
    ) => {
        try {
            const id = req.params.id;

            const car = await this.carService.getCar({ _id: id });

            if (!car) {
                throw new HttpException(404, `car with id:${id} is not found`);
            }
            const price = parseInt((req.body.price as any) || car?.price);

            const updatedCar = await this.carService.editCar(
                { _id: id },
                { ...req.body, price },
                { runValidators: true, new: true }
            );

            if (!updatedCar) {
                throw new HttpException(400, 'error updating car');
            }

            this.subcriber.notify(`car with id:${id} has been updated successfully`);
            res.status(200).json({ message: `car with id:${id} has been updated`, updatedCar });
        } catch (error) {
            this.handleError(res, error);
        }
    };

    public deleteCarHandler = async (
        req: Request<deleteCarSchemaInterface['params']>,
        res: Response
    ) => {
        try {
            const id = req.params.id;

            const car = await this.carService.getCar({ _id: id });

            if (!car) {
                throw new HttpException(404, `car with id:${id} is not found`);
            }
            const deletedCar = await this.carService.deleteCar({ _id: id });

            if (!deletedCar || deletedCar.deletedCount === 0) {
                throw new HttpException(400, 'error deleting car');
            }

            this.subcriber.notify(`car with id: ${id}} has been deleted`);

            res.status(200).json({ message: `car with id:${id} has been deleted` });
        } catch (error) {
            this.handleError(res, error);
        }
    };

    public getAllCarHandler = async (req: Request, res: Response) => {
        try {
            const cars = await this.carService.getAllCars({});

            if (!cars) {
                throw new HttpException(404, `there are no cars`);
            }
            res.status(200).json({ message: 'success', cars });
        } catch (error) {
            this.handleError(res, error);
        }
    };
}
export default CarController;
