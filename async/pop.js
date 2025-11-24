// async java functions
console.log("Async/Await Practice - start");

async function sayHello() {
    await new Promise(setTimeout(2000));
    console.log('Hello World');
}


function delayedPrint(callback) {
  setTimeout(callback(), 1000);
}

delayedPrint(function () {
  console.log("done");
});
