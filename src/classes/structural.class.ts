import { logger as log } from '@/utils/logger';

// base class to use in initializeClasses method in app.ts to witness results in console logs
// note: use the getInstance method for getting instance of the class or just use any pattern class in any server dependent code files 
export class StructuralClassesPattern {
    private static instance: StructuralClassesPattern;
    constructor() {
        this.initializeCreational();
    }
    private initializeCreational() {
        // this log is marked warn to not use in production
        log.warn('Structral patterns folder has been started');
    }

    static getInstance() {
        if (!StructuralClassesPattern.instance) {
            StructuralClassesPattern.instance = new StructuralClassesPattern();
        }
        return StructuralClassesPattern.instance;
    }
}

//  Adapter Pattern
//  Purpose:

// Allows incompatible interfaces to work together.
interface Logger {
    log(message: string): void;
}

class ThirdPartyLogger {
    write(msg: string) {
        console.log(`thirdPartyLogger: ${msg}`);
    }
}

class LoggerAdapter implements Logger {
    constructor(private thirdPartyLogger: ThirdPartyLogger) {}

    log(message: string): void {
        this.thirdPartyLogger.write(message);
    }
}

export const Logger: Logger = new LoggerAdapter(new ThirdPartyLogger());
// Decorator Pattern

//  Purpose:
// Add behavior to objects dynamically, without changing their class.

class ConsoleLogger implements Logger {
    log(message: string): void {
        console.log(message);
    }
}

class TimestampDecorator implements Logger {
    constructor(private Logger: Logger) {}

    log(message: string): void {
        const time = new Date().toISOString();
        this.Logger.log(`[${time}] ${message}`);
    }
}

const logger = new TimestampDecorator(new ConsoleLogger());
logger.log('App started');

//  Composite Pattern

// Purpose:

// Treat individual objects and compositions (groups of objects) uniformly.
// "Tree-like structure where both leaves and containers follow the same interface."

interface Shape {
    draw(): void;
}

class Circle implements Shape {
    draw() {
        console.log('Drawing a Circle');
    }
}

class Rectangle implements Shape {
    draw() {
        console.log('Drawing a Rectangle');
    }
}

class ShapeGroup implements Shape {
    private children: Shape[];
    constructor() {
        this.children = [];
    }

    public addShape(shape: Shape) {
        this.children.push(shape);
    }

    public draw(): void {
        for (const child of this.children) {
            child.draw();
        }
    }
}

const CompositeGroupsOfShapes = new ShapeGroup();

CompositeGroupsOfShapes.addShape(new Circle());
CompositeGroupsOfShapes.addShape(new Rectangle());

CompositeGroupsOfShapes.draw();

//  Proxy Pattern

//  Purpose:

// Provide a placeholder or surrogate for another object to control access.
// Used for lazy loading, logging, access control, caching.

interface API {
    request(endpoint: string): void;
}

class RealAPI implements API {
    request(endpoint: string): void {
        console.log(`Fetching data from ${endpoint}`);
    }
}

class LoggingProxy implements API {
    constructor(private realAPI: RealAPI) {}

    request(endpoint: string): void {
        console.log(`Logging: Request made to ${endpoint}`);
        this.realAPI.request(endpoint);
    }
}

// Usage
const api: API = new LoggingProxy(new RealAPI());
api.request('/users');
// Logs both messages
