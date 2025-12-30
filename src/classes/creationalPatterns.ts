import { logger } from '@/utils/logger';

// base class to use in initializeClasses method in app.ts to witness results in console logs
// note: use the getInstance method for getting instance of the class or just use any pattern class in any server dependent code files 
export class CreationalClassesPattern {
    private static instance: CreationalClassesPattern;
    constructor() {
        this.initializeCreational();
    }
    private initializeCreational() {
        // this log is marked warn to not use in production
        logger.warn('Creational patterns folder has been started');
    }

    static getInstance() {
        if (!CreationalClassesPattern.instance) {
            CreationalClassesPattern.instance = new CreationalClassesPattern();
        }
        return CreationalClassesPattern.instance;
    }
}

// Factory Design Pattern
//  Use When:
// You have many subclasses of a type.
// You want to centralize object creation.

interface User {
    role: string;
    permessions: () => string[];
}

export class Admin implements User {
    role = 'admin';
    permessions() {
        return ['read', 'write', 'delete', 'update'];
    }
}

export class Guest implements User {
    role = 'guest';
    permessions() {
        return ['read'];
    }
}

export class NormalUser implements User {
    role = 'user';
    permessions() {
        return ['read', 'write'];
    }
}

export class UserFactory {
    // NOTE: example for usage used in auth.controllers.ts for assigning roles and permissions
    public create(role: string): User | Error {
        switch (role) {
            case 'admin':
                return new Admin();
            case 'user':
                return new NormalUser();
            case 'guest':
                return new Guest();
            default:
                throw new Error('this role has no instance to be created');
        }
    }
}

// const user = UserFactory.create('admin');

// console.log(user.permessions());

// Factory Design Pattern

//  2. Abstract Factory Pattern

// Use When:
// You need to create families of related objects without specifying exact classes.

interface Button {
    render(): void;
}

class DarkButton implements Button {
    render(): void {
        console.log('Dark Mode is enabled');
    }
}

class LightButton implements Button {
    render(): void {
        console.log('light mode is enabled');
    }
}

interface UiFactory {
    createButton(): Button;
}

class DarkUiFactory implements UiFactory {
    createButton(): Button {
        return new DarkButton();
    }
}

class LightUiFactory implements UiFactory {
    createButton(): Button {
        return new LightButton();
    }
}

// usage

class AbstractFactory {
    private button: Button;
    constructor(private uiFactory: UiFactory) {
        this.button = this.uiFactory.createButton();
    }

    renderButton() {
        this.button.render();
    }
}

function renderUi(renderFactory: UiFactory) {
    const button = renderFactory.createButton();
    button.render();
}

// renderUi(new DarkUiFactory());
const button = new AbstractFactory(new LightUiFactory());

// button.renderButton(); //usage

// Abstract Factory Pattern

// Builder Pattern

// Use When:
// You need to build different representations of the same object.
// You have many optional fields.

class Report {
    title!: string;
    content!: string;
    footer?: string;
}

class ReportBuilder {
    private report: Report;
    constructor() {
        this.report = new Report();
    }

    public setTitle(title: string): this {
        this.report.title = title;
        return this;
    }

    public setContent(content: string): this {
        this.report.content = content;
        return this;
    }
    public setFooter(footer: string): this {
        this.report.footer = footer;
        return this;
    }

    public build(): Report {
        return this.report;
    }
}

const report = new ReportBuilder()
    .setTitle('bulider pattern')
    .setContent('when to use: when you have a multiple optional fields')
    .setFooter('design patterns')
    .build();

// console.log(report); // usage 

// Report {
// title: 'bulider pattern',
// content: 'when to use: when you have a multiple optional fields',
// footer: 'design patterns'
//   }

// builder end

// Singleton Pattern

// Use When:
// You need a shared resource (e.g. DB connection, config, logger).

class DBConnection {
    private static instance: DBConnection;

    private constructor() {
        console.log('Db connected');
    }

    static getInstance(): DBConnection {
        if (!DBConnection.instance) {
            DBConnection.instance = new DBConnection();
        }
        return DBConnection.instance;
    }

    public query(sql: string) {
        console.log(`Executing: ${sql}`);
    }
}

// const db1 =  DBConnection.getInstance()
// const db2 = DBConnection.getInstance()

// console.log(db1 === db2)
