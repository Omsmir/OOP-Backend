# 🧠 12-Week Deep OOP Mastery Program (with TypeScript + Express.js)

This repository documents a **12-week advanced Object-Oriented Programming (OOP) roadmap**, adapted into a **class-based backend architecture** using **TypeScript**, **Express.js**, and modern patterns like **Clean Code**, **SOLID principles**, and **Design Patterns**. This codebase includes:

- Highly structured backend with **ESLint**, **Prettier**, and **strict tsconfig.json**
- A powerful **path aliasing system** for modular architecture
- Deep exploration of OOP concepts
- Practical implementation of design patterns and system design

> 🧩 **Note:** There aren't isolated tutorials for each week. Instead, the full backend server composes all the weekly concepts into a unified, production-grade architecture. However, design pattern examples and learning materials are organized separately inside the `@classes` folder to teach and demonstrate each pattern in isolation.

---

## 📁 Folder Aliases (tsconfig.json)

```json
"paths": {
  "@/*": ["*"],
  "@config": ["src/config"],
  "@controllers/*": ["controllers/*"],
  "@exceptions/*": ["exceptions/*"],
  "@interfaces/*": ["interfaces/*"],
  "@middlewares/*": ["middlewares/*"],
  "@models/*": ["models/*"],
  "@routes/*": ["routes/*"],
  "@schemas/*": ["schemas/*"],
  "@services/*": ["services/*"],
  "@utils/*": ["utils/*"],
  "@classes/*": ["classes/*"]
}
```

### 📦 What lives in each path?

| Alias            | Description                                                                            |
| ---------------- | -------------------------------------------------------------------------------------- |
| `@config`        | Environment variables, database config, server setup                                   |
| `@controllers/*` | Request handlers using class-based controller logic                                    |
| `@exceptions/*`  | Custom error classes (e.g. NotFound, Unauthorized)                                     |
| `@interfaces/*`  | TypeScript interfaces and types shared across app                                      |
| `@middlewares/*` | Express middlewares (auth, error handling, logging)                                    |
| `@models/*`      | Mongoose models and schemas                                                            |
| `@routes/*`      | Route definitions mapped to controller methods                                         |
| `@schemas/*`     | Zod/Joi validation schemas                                                             |
| `@services/*`    | Business logic classes (e.g. UserService, AuthService)                                 |
| `@utils/*`       | Utility functions, helpers, formatters, loggers                                        |
| `@classes/*`     |  Design patterns classes, starting from Creational to Behavioral and **teaching patterns** |

---

## 📚 Week-by-Week Curriculum

### ✅ Week 1: OOP Basics (Encapsulation, Classes, Instances)

- Create real-world class models
- Understand `private`, `protected`, `public`
- Learn `getters`, `setters`, `constructor`

### ✅ Week 2: Inheritance & Polymorphism

- Class hierarchies: `Animal -> Dog/Cat`
- Method overriding
- Use interfaces and abstract classes

### ✅ Week 3: SOLID Principles

- Single Responsibility
- Open/Closed
- Liskov Substitution
- Interface Segregation
- Dependency Inversion

### ✅ Week 4: Composition Over Inheritance

- Mixins with `Object.assign`
- Strategy pattern
- Favor small components over rigid inheritance trees

### ✅ Week 5: Creational Design Patterns

- **Factory Pattern** (e.g. `UserFactory`)
- **Builder Pattern** (`ReportBuilder`)
- **Singleton** (`DBConnection`)
- **Abstract Factory**

### ✅ Week 6: Structural Design Patterns

- **Adapter** (`LoggerAdapter`)
- **Decorator** (`TimestampLogger`)
- **Composite** (`ShapeGroup`)
- **Proxy** (`LoggingProxy`)

### ✅ Week 7: Behavioral Design Patterns

- **Observer** (Event system)
- **Command** (Encapsulate request logic)
- **Strategy** (Pluggable behaviors)
- **State** (Finite state machine in backend)

### ✅ Week 8: Domain Modeling + Value Objects

- Domain-Driven Design intro
- Encapsulate logic into Value Objects (e.g. `Money`, `Email`, `PhoneNumber`)

### ✅ Week 9: Repositories & Aggregates

- Persistence layer abstraction
- Domain Aggregate root enforcement (e.g. `Order`)

### ✅ Week 10: Event-Driven Architecture

- Internal domain events
- Event dispatchers, listeners
- Async patterns with Redis/Queue

### ✅ Week 11: Advanced Types + Refactoring

- Utility types, template literals, enums, generics
- Refactor messy classes into clean interfaces and reusable components

### ✅ Week 12: Testing OOP Systems

- Unit testing services, repositories, controllers using Jest
- Mocks, spies, and stubs
- Full coverage of SOLID and patterns under test

---

## ✅ Prerequisites

- TypeScript (strict mode)
- Node.js / Express.js
- OOP fundamentals in JS or another language
- Familiarity with async/await, Promises

---

## 📌 Example Command Scripts (package.json)

```json
"scripts": {
    "dev": " cross-env NODE_ENV=development ts-node-dev --respawn --transpile-only --require tsconfig-paths/register src/server.ts",
    "start": "npm run build && cross-env NODE_ENV=production node dist/server.js",
    "build": "swc src -d dist --source-maps --copy-files",
    "build:tsc": "tsc && tsc-alias",
    "lint": "eslint  src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix"
}
```

---

## 🏁 Final Deliverables

- [ ] `/creational-patterns`
- [ ] `/structural-patterns`
- [ ] `/behavioral-patterns`
- [ ] `/domain-modeling`
- [ ] `/event-driven`
- [ ] `/test-suite`

> Build your own advanced backend playground and master Object-Oriented design with real architecture.

---

## 👨‍🏫 Inspired By:

- Refactoring.Guru
- TypeScript Deep Dive
- Domain-Driven Design (Vaughn Vernon / Eric Evans)
- Clean Architecture by Uncle Bob

---

## 📬 Questions or Suggestions?

Open an issue or message me directly!

Happy Hacking 🚀
