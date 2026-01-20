// arrays.js

function manageFruits() {
    let fruits = ['Apple', 'Banana', 'Cherry'];

    console.log('Fruits Array:', fruits);

    // Accessing elements
    console.log('First Array:', fruits[0]);

    // Adding an element
    fruits.push('Date');
    console.log('Fruits Array after push:', fruits);

    // Iterating over an array
    for (let i = 0; i < fruits.length; i++) {
        console.log('Fruit at index', i, ':', fruits[i]);
    }
}

manageFruits();

