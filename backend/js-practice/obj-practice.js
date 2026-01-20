let person = {
    name: 'steve',
    age : 24,
    isStudent : true,
    print() {
        console.log(`${name} ${this.name}`);
    }
};

const age = 'age';
console.log(person.age);
console.log(person['age']);
console.log(person[age]);

for (let key in person) {
    console.log(`${key} stores ${person[key]}`);
};

let calculator = {
    add: function(x,y) {
        return x+y;
    },
    subtract: function(x,y) {
        return x-y;
    },
    multiply: function(x,y) {
        return x*y;
    },
    divide: function(x,y) {
        return x/y;
    }
};

console.log(calculator.add(10,5));
console.log(calculator.subtract(10,5));
console.log(calculator.add(10,5));
console.log(calculator.add(10,5));

console.log(JSON.stringify(calculator));
console.log('----------------------------------');
console.log(calculator);

