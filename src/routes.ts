import BookRoute from "./routes/book.route";
import CarRoute from "./routes/car.route";
import IndexRoute from "./routes/index.route";

export const Routes = [
    new IndexRoute(),
    new CarRoute(),
    new BookRoute()
]