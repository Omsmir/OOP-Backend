import CarController from '@/controllers/car.controller';
import { routes } from '@/interfaces/routes.interface';
import upload from '@/middlewares/multer';
import { validate } from '@/middlewares/validateResource';
import { carSchema, deleteCarSchema, updateCarSchema } from '@/schemas/car.schema';
import { logger } from '@/utils/logger';
import { Router } from 'express';

class CarRoute implements routes {
    public path = '/cars';
    public router = Router();
    private carController = new CarController();
    constructor() {
        this.initializeRoute();
    }

    private initializeRoute() {
        this.router.post(
            this.path,
            upload.none(),
            validate(carSchema),
            this.carController.createCarHandler
        );
        this.router.get(`${this.path}/:id`, this.carController.getCarController);

        this.router.get(this.path, this.carController.getAllCarHandler);

        this.router.put(
            `${this.path}/:id`,
            upload.none(),
            validate(updateCarSchema),
            this.carController.updateCarHandler
        );

        this.router.delete(
            `${this.path}/:id`,
            validate(deleteCarSchema),
            this.carController.deleteCarHandler
        );
    }
}

export default CarRoute;
