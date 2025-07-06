import { routes } from '@/interfaces/routes.interface';
import { Request, Response, Router } from 'express';

class IndexRoute implements routes {
    public path = '/';
    public router = Router();
    constructor() {
        this.initializeRoute();
    }

    private initializeRoute() {
        this.router.get(this.path, (req: Request, res: Response) => {
            res.sendStatus(200);
        });
    }
}

export default IndexRoute;
