const prompt = require('prompt-sync')();

let budget = parseFloat(prompt("Enter your budget: "));
const expenses = [];

function addExpense(amount, category) {
    expenses.push({amount: parseFloat(amount), category});
    console.log('Expenses added');
}

function calculateTotal() {
    const total = 0;
    for (let i = 0; i < expenses.length(); i++) {
        total += expenses[i];
    }
    console.log('Total:', total);
}

function total() {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
}

function checkBudget() {
    const total = calculateTotal();
    return total > budget;
}

function removeExpense(category) {
    const index = expenses.findIndex(exp => exp.category === category);
    if (index !== -1) {
        expenses.splice(index, 1);
        console.log("Expense removed.");
    } else {
        console.log("No expense found for that category.");
    }
}

while (true) {
    console.log('Menu:\n1. Add an Expense\n2. View Total Expenses\n3. Check Budget\n4. Remove an Expense\n5. Exit');
    let answer = console.log(prompt('Enter number:'));

    if (answer == '1') {
        const amount = 0;
        const category = 0;
        addExpense(amount, category);
    } else if (answer == '2') {
        calculateTotal();
    } else if (answer == '3') {
        checkBudget();
    } else if (answer == '4') {
        const category = prompt("Enter category to remove: ");
        removeExpense(category);
    } else if (answer == '5') {
        console.log('Exiting...');
        break;
    } else {
        console.log('Wrong input... try again');
    }
}

