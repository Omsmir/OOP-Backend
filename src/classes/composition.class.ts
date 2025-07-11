// 1. Define a type for any object that has a name
type Named = {
    name: string;
};

// 2. Define behaviors with `this` context
const canFly = {
    fly(this: Named) {
        console.log(`${this.name} is flying.`);
    },
};

const canSwim = {
    swim(this: Named) {
        console.log(`${this.name} is swimming.`);
    },
};

// 3. Use composition with the proper type
function createDuck(name: string): Named & typeof canFly & typeof canSwim {
    const duck: Named = { name };
    return Object.assign(duck, canFly, canSwim);
}

// ✅ Safe usage
const donald = createDuck('Donald');
donald.fly(); // Donald is flying.
donald.swim(); // Donald is swimming.
