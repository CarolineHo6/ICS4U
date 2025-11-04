const num = [10, 25, 30, 45, 60, -75, 80, 90, 100];
const number = [55, 65, 75, 85, 95, 105, 115];
const name1 = ["Alice", "Bob", "Charlie", "David", "Eve"];
const obj = [
  { name: 1, price: 10 },
  { name: 2, price: 20 },
  { name: 3, price: 30 },
  { name: 4, price: 40 },
  { name: 5, price: 50 },
  { name: 6, price: 60 },
];
const book = [
    {title: "1984", isAvailable: true},
    {title: "Bilibili", isAvailable: true},
    {title: "Cinderella", isAvailable: false},
    {title: "Dune", isAvailable: true},
    {title: "Eloquent JavaScript", isAvailable: false},
    {title: "Fahrenheit 451", isAvailable: true}
]

//homework
// 1
const squares = num.map(num => num * num);
console.log(squares);

// 2
const above80 = number.filter(num => num > 80);
console.log(above80);

//3
const sum = num.reduce((acc, num) => acc + num, 0);
console.log(sum);

//4
const greeting = name1.forEach(n => "Hello", n);
console.log(greeting);

// 5
const greaterThan50 = obj.find(item => item.price > 50);
console.log(greaterThan50);

// 6
const negative = num.some(num => num < 0);
console.log(num);
console.log(number);

// 7 if all book are available
const avail = book.every(book => book.isAvailable);
console.log(avail);

// 8
const

