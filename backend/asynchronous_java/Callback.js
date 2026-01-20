
console.log("Start");

function sayHello() {
    console.log("Hello after 2 seconds");
};

setTimeout(sayHello, 2000);

console.log("End");


function done() {
    console.log("finished task.");
}

setTimeout(done, 1000);


setTimeout(() => {
    console.log("Finished task.");
}, 1000);


function greet(name, callback) {
    console.log("Hello, " + name);
    callback(name);
}

function sayGoodbye(person) {
    console.log("Goodbye, " + person);
}


greet("bob", sayGoodbye);

function calculate(a, b, callback) {
    let result = callback(a, b);
    console.log("Result:", result);
}

function add(x, y) {
    return x + y;
}

calculate(6, 7, add); // Result: 13


const ages = [12, 17, 18, 24, 30];

const adults = ages.filter(function (age) {
    return age >= 18;
});

console.log(adults); // [18, 24, 30]


step1(function (result1) {
    step2(result1, function (result2) {
        step3(result2, function (result3) {
            step4(result3, function (finalResult) {
                console.log("Done!");
            });
        });
    });
});



const getTodos = async () => {
    const response = await fetch('todos/Callback.js');
    console.log(response);
};

const test = getTodos();
console.log(test);

