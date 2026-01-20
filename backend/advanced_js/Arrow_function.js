let add = function (x, y) {
    return x + y;
};

console.log(add(5, 6));

let add2 = (x, y) => { x + y };

console.log(add2(5, 6));

// let isEven = (x) => x % 2 == 0;
// green if even and red if false
let isEven = (x) => x % 2 == 0 ? 'green' : 'red';
console.log(isEven(7));
console.log(isEven(8));

const arr = [1,2,3,4,5,6,7,8,9];

let sqrArr = (arr) => {
    let tempArr = [];
    for (let e of arr) {
        tempArr.push = e*e;
    }
}

console.log(sqrArr(arr));

const arr2 = [-5, 3, -1, 6, 0, -7, 8, 4];

let filterArr = (arr) => {
    let tempArr = [];
    for (let e of arr) {
        if (e >= 0) {
            tempArr.push(e);
        }
    }
    return tempArr;
}

console.log(filterArr(arr2));

let factorial = (n) => n == 0 ? 1 : n * factorial(n-1);

let factorial1 = (n) => {
    let num = 1;
    for (let i = n; n > 0; i--) {
        num *= i;
    };
    return num;
};

console.log(factorial(5));

let sortArr = (arr) => {
    if (arr.length <= 1) return arr;

    const mid = Math.floor(arr.length / 2);
    const left = sortArr(arr.slice(0, mid));
    const right = sortArr(arr.slice(mid, arr.length));

    const merge = (left, right) => {
        let result = [];
        while (left.length && right.length) {
            if (left[0] < right[0]) {
                result.push(left.shift());
            } else {
                result.push(right.shift());
            }
        }
        return result.concat(left, right);
    }
    return merge(left, right);
}

let arr3 = [38, 27, 43, 3, 9, 82, 10];

console.log(sortArr(arr3));

let palindrome = (s) => {
    let i = Math.floor(s.length / 2);
    let l = s.length;
    let t = false;

    for (let j = 0; j < i; j++) {
        if (s[j] === s[l]) {
            t = true;
        } else {
            t = false;
        }
    }

    return t;
}

let palindrome1 = (s) => {
    let rev = s.split('').reverse().join('');
    return s === rev;
}

console.log(palindrome('racecar'));

let maxArr = (arr) => {
    let max = arr[0];
    for (let e of arr) {
        if (e > max) {
            max = e;
        }
    }
    return max;
}

console.log(maxArr(arr3));

let fahrenheitToCelsius = (f) => (f - 32) * 5/9;

console.log(fahrenheitToCelsius(100));

let mapArrToStrLen = (arr) => {
    let tempArr = [];
    for (let e of arr) {
        tempArr.push(e.length);
    }
    return tempArr;
}

console.log(mapArrToStrLen(['apple', 'banana', 'cherry']));

