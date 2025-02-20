"use strict";

// console.log('Hello World!'); // El print en javascript es console.log

// function area(base, height) { // En cuanto a las funciones, no es necesario definir el tipo de dato de los parámetros ni de lo que regresa
//     return base * height / 2;
// }

// console.log(area(2,4)); // Puedes imprimir el resultado de una función directamente
 
// areaa = area(4,5);

// console.log(areaa); // Puedes guardar el resultado de una función en una variable y después imprimirlo

function firstNonRepeating(string) {
    console.log(string);
    for (let i=0; i<string.length; i++) {
        let repeated = false;
        for (let j=0; j<string.length; j++) {
            if (string[i] == string[j] && i != j) {
                repeated = true;
                break;
            }
        }
        console.log(`Char: ${string[i]}, repeated: ${repeated}`);
        if (!repeated) {
            return string[i];
        }
    }
}

function bubbleSort(array) {
    let n = array.length;
    for (let i=0; i<n-1; i++) {
        for (let j=0; j<n-i-1; j++) {
            if (array[j] > array[j+1]) {
                let temp = array[j];
                array[j] = array[j+1];
                array[j+1] = temp;
            }
        }
    }
}

function invertArray(array) {
    let n = array.length;
    let newArray = [];
    for (let i=n-1; i>=0; i--) {
        newArray.push(array[i]);
    }
    return newArray;
}

function invertArrayInPlace(array) {
    let n = array.length;
    for (let i=0; i<n/2; i++) {
        let temp = array[i];
        array[i] = array[n-i-1];
        array[n-i-1] = temp;
    }
}
function capitalize(string) {
    let words = string.split(' ');
    let newString = '';
    for (let i=0; i<words.length; i++) {
        let word = words[i];
        let newWord = word[0].toUpperCase() + word.slice(1);
        newString += newWord + ' ';
    }
    return newString.trim();
}

function mcd (a, b) {
    if (a == 0) {
        return b;
    }
    return mcd(b % a, a);
}

function hackerSpeak(string) {
    let newString = '';
    for (let i=0; i<string.length; i++) {
        switch (string[i]) {
            case 'a':
                newString += '4';
                break;
            case 'e':
                newString += '3';
                break;
            case 'i':
                newString += '1';
                break;
            case 'o':
                newString += '0';
                break;
            case 's':
                newString += '5';
                break;
            default:
                newString += string[i];
        }
    }
    return newString;
}

function factorize(number) {
    let factors = [];
    for (let i=1; i<=number; i++) {
        if (number % i == 0) {
            factors.push(i);
        }
    }
    return factors;
}

function deduplicate(array){
    let newArray = [];
    for (let i=0; i<array.length; i++) {
        if (!newArray.includes(array[i])) {
            newArray.push(array[i]);
        }
    }
    return newArray;
}

function findShortestString(array){
    let shortest = array[0];
    for (let i=1; i<array.length; i++) {
        if (array[i].length < shortest.length) {
            shortest = array[i];
        }
    }
    return shortest;
}

function isPalindrome(string){ 
    let reversed = '';
    for (let i=string.length-1; i>=0; i--) {
        reversed += string[i];
    }
    if (string == reversed) {
        return true;
    }
}

function sortStrings (array) {
    let newArray = array.sort();
    return newArray;
}

function stats (array) {
    let mediana;
    let moda;
    let maxCount = 0;
    let count = 0;
    let n = array.length;
    for (let i=0; i<n; i++) {
        count = 0;
        for (let j=0; j<n; j++) {
            if (array[i] == array[j]) {
                count++;
            }
        }
        if (count > maxCount) {
            moda = array[i];
            maxCount = count;
        }
    }
    if (n % 2 == 0) {
        mediana = (array[n/2] + array[n/2 - 1]) / 2;
    } else {
        mediana = array[(n/2)-0.5];
    }
    return {moda, mediana};
}

function popularString(array){
    let maxCount = 0;
    let count = 0;
    let popular;
    for (let i=0; i<array.length; i++) {
        count = 0;
        for (let j=0; j<array.length; j++) {
            if (array[i] == array[j]) {
                count++;
            }
        }
        if (count > maxCount) {
            popular = array[i];
            maxCount = count;
        }
    }
    return popular;
}

function isPowerOf2(number) {
    if (number == 1) {
        return true;
    }
    if (number % 2 == 0) {
        return isPowerOf2(number / 2);
    }
    return false;
}

function sortDescending(array) {
    for (let i=0; i<array.length; i++) {
        for (let j=0; j<array.length; j++) {
            if (array[i] > array[j]) {
                let temp = array[i];
                array[i] = array[j];
                array[j] = temp;
            }
        }
    }
}

// firstNonRepeating('abadbabdbejft') debería regresar 'e'
console.log(firstNonRepeating('abadbabdbejft')); 

// // // bubbleSort([64, 34, 25, 12, 22, 11, 90]) debería regresar [11, 12, 22, 25, 34, 64, 90]
let arregloBubbleSort = [64, 34, 25, 12, 22, 11, 90];
console.log(arregloBubbleSort);
bubbleSort(arregloBubbleSort);
console.log(arregloBubbleSort);

// // invertArray debería regresar [5, 4, 3, 2, 1]
let arregloInvert = [1, 2, 3, 4, 5];
console.log(arregloInvert);
arregloInvert = invertArray(arregloInvert);
console.log(arregloInvert);

// // invertArrayInPlace debería regresar [9, 8, 7, 6, 5]
let arregloInvertInPlace = [5, 6, 7, 8, 9];
console.log(arregloInvertInPlace);
invertArrayInPlace(arregloInvertInPlace);
console.log(arregloInvertInPlace);

// capitalize('hola mundo') debería regresar 'Hola Mundo'
console.log(capitalize('hola mundo'));

// mcd(8, 12) debería regresar 4
console.log("El máximo común divisor de 8 y 12 es:", mcd(8, 12));

// hackerSpeak('javascript') debería regresar 'j4v45cr1pt'
console.log(hackerSpeak('javascript'));

// factorize(12) debería regresar [1, 2, 3, 4, 6, 12]
console.log(factorize(12));

// deduplicate([1, 1, 1, 2, 3, 4, 5, 5, 6]) debería regresar [1, 2, 3, 4, 5, 6]
let arregloDeduplicate = [1, 1, 1, 2, 3, 4, 5, 5, 6];
console.log(arregloDeduplicate);
arregloDeduplicate = deduplicate(arregloDeduplicate);
console.log(arregloDeduplicate);

// findShortestString(['python', 'javascript', 'cad', 'ruby']) debería regresar 'cad'
let arregloFindShortestString = ['python', 'javascript', 'cad', 'ruby'];
console.log(arregloFindShortestString);
console.log(findShortestString(arregloFindShortestString));

// isPalindrome('radar') debería regresar true
let string = 'radar';
if (isPalindrome(string)) {
    console.log(`La palabra ${string} es palíndroma`);
} else {
    console.log(`La palabra ${string} no es palíndroma`);
}

// sortStrings(['python', 'javascript', 'cad', 'ruby']) debería regresar ['cad', 'javascript', 'python', 'ruby']
let arregloSortStrings = ['python', 'javascript', 'cad', 'ruby'];
console.log(arregloSortStrings);
console.log(sortStrings(arregloSortStrings));

// stats([1, 3, 6, 8, 9, 3]) debería regresar {moda: 3 , mediana: 7 }
let arregloStats = [1, 3, 6, 8, 9, 3];
console.log(arregloStats);
console.log(stats(arregloStats));

// popularString(['apple', 'banana', 'apple', 'banana', 'apple', 'orange']) debería regresar 'apple'
let arregloPopularString = ['apple', 'banana', 'apple', 'banana', 'apple', 'orange'];
console.log(arregloPopularString);
console.log("La palabra más popular es: ", popularString(arregloPopularString));

// isPowerOf2(8) debería regresar true
let num = 8;
if (isPowerOf2(num) == true) {
    console.log(num, 'es una potencia de 2');
} else {
    console.log(num, 'no es una potencia de 2');
}

// sortDescending([1, 3, 6, 8, 9, 3]) debería regresar [9, 8, 6, 3, 3, 1]
let arregloSortDescending = [1, 3, 6, 8, 9, 3];
console.log(arregloSortDescending);
sortDescending(arregloSortDescending);
console.log(arregloSortDescending);