import BaseRoute from './base.route';
import authController from '@/controllers/auth.postgres.controller';

class IndexRoute extends BaseRoute {
    constructor(private readonly controller: authController) {
        super('/');
        this.initializeRoutes();
    }

    protected initializeRoutes() {
        this.router.get(this.path, this.controller.IndexRoute);
    }
}

export default IndexRoute;
