import CarController from '@/controllers/car.controller';
import upload from '@/middlewares/multer';
import { validate } from '@/middlewares/validateResource';
import { carSchema, deleteCarSchema, updateCarSchema } from '@/schemas/car.schema';
import BaseRoute from './base.route';

class CarRoute extends BaseRoute {

    private carController = new CarController();
    constructor() {
        super('/cars');
        this.initializeRoutes();
    }

    protected initializeRoutes() {
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
