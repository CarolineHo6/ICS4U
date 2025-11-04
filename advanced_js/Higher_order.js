const num = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const number = [90, 100, 20, 30, 54, 39, 2, 67, 8];
const arr = [1,2,4,5,6,7,8];
const name1 = ['daisy', 'riya', 'louisa'];

const result = arr.filter(x => x % 2 === 0);
console.log(result);

const student = [{name: 'Steve', age: 17}, {name: 'Jack', age: 18}, {name: "Daisy", age: 16}];

// function for catherine
const minors = student.filter(s => s.age < 18);
console.log(minors);

// acc = accumulator what it was after the last interation
const val = arr.reduce((acc, num) => acc + num * num, 0);
console.log(val);

const sorted = ["alpha", "bet", "steve", "chalk", "daniel", "peng"].sort((a, b) => a.length() - b.length());
console.log(sorted);

// students oldest to youngest
const sortedStudents = student.sort((a, b) => b.age - a.age);
console.log(sortedStudents);


