// Factory Design Pattern
//  Use When:
// You have many subclasses of a type.
// You want to centralize object creation.

interface User {
    role: string;
    permessions: () => string[];
}

class Admin implements User {
    role = 'admin';
    permessions() {
        return ['read', 'write', 'delete', 'update'];
    }
}

class Guest implements User {
    role = 'Guest';
    permessions() {
        return ['read'];
    }
}

export class UserFactory {
    static create(role: string): User {
        switch (role) {
            case 'admin':
                return new Admin();
            case 'Guest':
                return new Guest();
            default:
                throw new Error('this role has no instance to be created');
        }
    }
}

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
function renderUi(renderFactory: UiFactory) {
    const button = renderFactory.createButton();
    button.render();
}

renderUi(new DarkUiFactory());

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

// console.log(report)
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
    private static instance : DBConnection
    
    private constructor(){
        console.log("Db connected")
    }

    static getInstance ():DBConnection {
        if(!DBConnection.instance){
            DBConnection.instance = new DBConnection()
        }
        return DBConnection.instance
    }

    public query(sql:string){
        console.log(`Executing: ${sql}`);
    }
}

// const db1 =  DBConnection.getInstance()
// const db2 = DBConnection.getInstance()

// console.log(db1 === db2)