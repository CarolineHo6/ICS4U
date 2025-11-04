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
];
const employee = [
  {name: "Cindy", yearsAtCompany: 2.0},
  {name: "Caitlin", yearsAtCompany: 1.0},
  {name: "Daisy", yearsAtCompany: 0.1},
  {name: "Ian", yearsAtCompany: 5.1},
  {name: "Daniel", yearsAtCompany: 6},
  {name: "Stefano", yearsAtCompany: 6},
  {name: "Mr. DesLauriers", yearsAtCompany: 10}
];
const num2 = [
  [1,2,3],
  [4,5,6]
]
const movie = [
  {title: "Inception", year: 2010},
  {title: "The Matrix", year: 1999},
  {title: "Interstellar", year: 2014},
  {title: "The Godfather", year: 1972},
  {title: "Pulp Fiction", year: 1994}
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
const greeting = name1.forEach(n => "Hello" + n);
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
const moreThan5Years = employee.findIndex(employee => employee.yearsAtCompany > 5);
console.log(moreThan5Years);

// 9
const flatten = num2.flatMap(num2 => num2*3);
console.log(flatten);

// 10
const sort = movie.sort((a,b) => a.year-b.year);
console.log(sort);

