import promptSync from "prompt-sync";
import books from "./books.js";


const prompt = promptSync();

function addBook(title, author, year) {
    const newBook = {
        title: this.title,
        author: this.author,
        year: this.year,
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
            console.log(book[index].title);
        };
    };
};

function borrowBook(title) {
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

function returnBook(title) {
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

function listBookAuthor(author) {
    console.log(`Books by the author, ${author}`)
    for (let index in books) {
        let book = books[index];
        if (book.author === author) {
            console.log(book.title);
        };
    };
};

function findBooksBeforeYear(year) {
    for (let index in books) {
        let book = books[index];
        if (book.year < year) {
            console.log(book.title);
        };
    };
};

function removeBook(title) {
    for (let index in books) {
        let book = books[index];
        if (book.title === title) {
            library.splice(index, index+1);
            console.log(`${title} is removed`);
        } else {
            console.log(`${title} is not found in the library`);
        };
    };
};

while (true) {
    console.log('1. Add a new book \n2. List available books \n3. Borrow a book \n4. Return a book \n5. List books by author \n6. Find books before a year \n7. Remove a book \n8. Exit program');
    const num = console.log(prompt('What do you want to do?'));
    
    if (num === 1) {
        let title = console.log(prompt('Title:'));
        let author = console.log(prompt('Author:'));
        let year = console.log(prompt('Year:'));
        addBook(title, author, year);
    } else if (num === 2) {
        listBooks();
    } else if (num === 3) {
        let book = console.log(prompt('What book would you like to borrow?'));
        borrowBook(book);
    } else if (num === 4) {
        let book = console.log(prompt('What are you returning?'));
        returnBook(book);
    } else if (num === 5) {
        let author = console.log(prompt('What author?'));
        listBookAuthor(author);
    } else if (num === 6) {
        let year = console.log(prompt('What year?'));
        findBooksBeforeYear(year);
    } else if (num === 7) {
        let book = console.log(prompt('What book?'));
        removeBook(book);
    } else if (num === 7) {
        console.log('BYEBYE!');
        break;
    } else {
        console.log('Invalid input, try again stupid');
    };
};

