import CarController from '@/controllers/car.controller';
import { routes } from '@/interfaces/routes.interface';
import upload from '@/middlewares/multer';
import { validate } from '@/middlewares/validateResource';
import { carSchema } from '@/schemas/car.schema';
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
    }
}

export default CarRoute;
