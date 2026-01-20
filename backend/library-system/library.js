import promptSync from "prompt-sync";
import books from "./books.js";


const prompt = promptSync();

function addBook() {
    let title = prompt('Title: ');
    let author = prompt('Author: ');
    let year = prompt('Year: ');
    const newBook = {
        title: title,
        author: author,
        year: year,
        isAvailable: true
    };

    books.push(newBook);
    console.log(`Book ${newBook} is added`);
};

function listBooks() {
    console.log('Available books:');
    for (let index in books) {
        let book = books[index];
        if (book.isAvailable) {
            console.log(book.title);
        };
    };
};

function borrowBook() {
    let title = prompt('What book would you like to borrow? ');
    let book;
    for (let index in books) {
        if (books[index].title === title) {
            book = books[index];
            break;
        };
    };
    if (book.isAvailable) {
        book.isAvailable = false;
        console.log(`You have taken out ${book}`);
    } else {
        console.log(`${book} is not available`);
    };
};

function returnBook() {
    let title = prompt('What are you returning? ');
    let book;
    for (let index in books) {
        if (books[index].title === title) {
            book = books[index];
            break;
        };
    };
    book.isAvailable = true;
    console.log(`${title} is returned`);
};

function listBookAuthor() {
    let author = prompt('What author? ');
    console.log(`Books by the author, ${author}`)
    for (let index in books) {
        let book = books[index];
        if (book.author === author) {
            console.log(book.title);
        };
    };
};

function findBooksBeforeYear() {
    let year = prompt('What year? ');
    for (let index in books) {
        let book = books[index];
        if (book.year < year) {
            console.log(book.title);
        };
    };
};

function removeBook() {
    let title = prompt('What book? ');
    for (let index in books) {
        let b = books[index];
        if (b.title === title) {
            books.splice(index, 1);
            console.log(`${title} is removed`);
        };
    };
    console.log(`${title} is not found in the library`);
};

while (true) {
    console.log('--------Library Options--------');
    console.log('1. Add a new book \n2. List available books \n3. Borrow a book \n4. Return a book \n5. List books by author \n6. Find books before a year \n7. Remove a book \n8. Exit program');
    let num = prompt('What do you want to do? (1-8) ');

    switch (num) {
        case '1':
            addBook();
            break;
        case '2':
            listBooks();
            break;
        case '3':
            borrowBook();
            break;
        case '4':
            returnBook();
            break;
        case '5':
            listBookAuthor();
            break;
        case '6':
            findBooksBeforeYear();
            break;
        case '7':
            removeBook();
            break;
        case '8':
            console.log('BYEBYE!');
            process.exit();
        default:
            console.log('Invalid input, try again');
            break;
    }

    // if (num === '1') {
    //     addBook();
    // } else if (num === '2') {
    //     listBooks();
    // } else if (num === '3') {
    //     borrowBook();
    // } else if (num === '4') {
    //     returnBook();
    // } else if (num === '5') {
    //     listBookAuthor();
    // } else if (num === '6') {
    //     findBooksBeforeYear();
    // } else if (num === '7') {
    //     removeBook();
    // } else if (num === '8') {
    //     console.log('BYEBYE!');
    //     break;
    // } else {
    //     console.log('Invalid input, try again');
    // };
};

