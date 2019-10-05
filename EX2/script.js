/**
 * JavaScript Exercise 1
 */

 /**
 * @param {number[]} a - The array of numbers.
 * @param {number} c - The scalar multiplier.
 * @return {number[]} An array computed by multiplying each element of the input array `a`
 * with the input scalar value `c`.
 */
function scalar_product(a, c) {
  if (!Array.isArray(a)){
   return undefined;
  }
 if (typeof c !== "number"){
  return a;
 }
 let b = a.map(x => x*c);
 return b;

}

/**
 * @param {number[]} a - The first array of numbers.
 * @param {number[]} b - The second array of numbers.
 * @return {number} A value computed by summing the products of each pair
 * of elements of its input arrays `a`, `b` in the same position.
 */
function inner_product(a, b) {
 if (!Array.isArray(a) || !Array.isArray(b) || (a.length !== b.length)){
  return undefined;
 }
  let c = 0;
  for (let i = 0; i < a.length; i++){
   c += a[i] * b[i];
  }
  return c;
}

/**
 * @param {*[]} a - The array.
 * @param {function} mapfn - The function for the map step.
 * @param {function} [reducefn= function(x,y) { return x+y; }] - The
 * function for the reduce step.
 * @param {string} [seed=""] - The accumulator for the reduce step.
 * @return {*} The reduced value after the map and reduce steps.
 */
function mapReduce(a, f, combine, seed="") {
 if(!Array.isArray(a))
  return undefined;
 if (typeof f !== "function")
  return undefined;

 let ans = seed;
 if(typeof combine === "undefined") {
  combine = function (x, y) {
   return x+y;
  };
 }
 for (let i = 0; i < a.length; i++){
  ans = combine(ans, f(a[i]));
 }
 return ans;
}

/**
 * @param {number[]} a - The first sorted array of numbers.
 * @param {number[]} b - The second sorted array of numbers.
 * @return {number[]} A sorted array with all the elements from
 * both `a` and `b`.
 */
function mergeSortedArrays(a, b) {
 if (!Array.isArray(a) || !Array.isArray(b)){
  return undefined;
 }
 let ans = [], i = 0; j = 0;

 while (i < a.length && j < b.length) {
  if (a[i] < b[j]) {
   ans.push(a[i]);
   i++; // move a array cursor
  } else {
   ans.push(b[j]);
   j++; // move b array cursor
  }
 }

 return ans
     .concat(a.slice(i))
     .concat(b.slice(j));
}

/**
* @param {integer} x - The first integer.
* @param {integer} y - The second integer.
* @param {integer} [step=1] - The value to add at each step.
* @return {integer[]} An array containing numbers x, x+step, … last, where:
*    - last equals x + n*step for some n,
*    - last <= y < last + step if step > 0 and
*    - last + step < y <= last if step < 0.
*/
function range(x, y, step=1) {
 if (step == 0 || !Number.isInteger(x) || !Number.isInteger(y) || !Number.isInteger(step)){
  return  undefined;
 }
 let ans = [];
 if (step > 0 && x <= y){
  for (let i = x; i<= y; i += step){
   ans.concat(i);
  }
 } else if (step < 0 && x >= y){
  for (let i = y; i >= x; i += step){
   ans.concat(i);
  }
 }



 return ans;
}

/**
* @param {*[]} a - The array to flatten.
* @return {*[]} A flattened array.
*/
function flatten(arr) {
 if(!Array.isArray(arr)) {
  return arr;
 }

 let array = [];
 for(let i = 0; i < arr.length; i++) {
  array = array.concat(flatten(arr[i]));
 }
 return array;
}

/**
 * @param {integer} [line_size=72] - The line size.
 * @return {function} A function that takes a string as an argument
 * and returns an array of strings where:
 *   a. each string length is no more than `line_size` and
 *   b. doesn't contain line breaks, tabs, double spaces and initial/trailing white spaces.
 */
function mkPrettyPrinter(line_size=72) {
 if(!Number.isInteger(line_size)) return undefined;
 return function (s) {
  if (typeof s !== "string") return undefined;
  let ans = [];
  let count = 0;
  let acc = "";
  let data = s.split(/\s+/);
  for (let i = 0; i < data.length; i++){
   if(acc.length + data[i].length < line_size){
    acc += data[i];
    ans.push(acc);
    acc = "";
   } else {
    acc += data[i] + " ";
   }
  }
  return ans;
 }
}

/**
* @param {integer} line_size - The line size.
* @param {integer} [level=0] level - The indentation level.
* @return {function} A function twith the following behavior:
*     - If called with an integer `n`, change the indentation level by
*       adding `n`to the current indentation level.
*     - If called with `true`, return the current indentation level.
*     - If called with a string:
*         - break it into lines with length (after adding the indentation)
*           no more than `line_size`,
*         - add spaces in front of each line according to the current
*           indentation level and
*         - store the resulting lines internally.
*     - [optional] If called with an array of strings, create an
*       bullet list (using `*`) taking current indentation level into
*       account. Also, each element should be properly broken into lines and indented.
*     - If called with no arguments, produce an array with the lines stored so far.
*       Internal storage must be emptied. Indentation level must not be changed.
*/
function mkIndenter(line_size, level) {
}

/**
 * JavaScript Exercise 2
 */

 /**
 * Calculates the number of occurrences of letters in a given string
 * @param {string} a - The input string.
 * @return {number[]} An array indexed by the letter characters found in the string.
 */
function letter_frequency(s) {

 if(typeof s !== "string") return undefined;
 let b = s.toUpperCase();
 let ans = [];
 let data = b.split(/\s+/);
 for(let i = 0; i < data.length; i++){
  for (let j = 0; j < data[i].length; j++){
   if (typeof ans[data[i][j]] === "undefined"){
    ans[data[i][j]] = 1;
   } else {
    ans[data[i][j]] += 1;
   }
  }
 }
 return ans;
}

/**
 * Displays the output of the letter frequency analysis in an HTML table
 * generated within the `dom` element passed as parameter
 * @param {number[]} a - The array indexed by the letter characters as returned
 * from `letter_frequency()`.
 * @param {Object} dom - The DOM element that will contain the resulting table.
 * @return {undefined}
 */
function display_letter_frequency(a, dom) {
 if(!Array.isArray(a) || !(typeof dom === "object")) return undefined;
 if(a.length===0) return undefined;
 let b = a.slice()
 let table = dom.createElement("table");
 dom.appendChild(table);
 for(let x in b){
  let row = table.insertRow();
  let cell1 = row.insertCell();
  let cell2 = row.insertCell();
  cell1.innerHTML = x;
  cell2.innerHTML = b[x];
 }
}

/**
 * Links the provided input text field in the test page with the table.
 * @param {Object} inputEl - The DOM object of the input element in test.html.
 * @return {undefined}
 */
function online_frequency_analysis(inputEl) {
}

/**
 * JavaScript Exercise 3
 */
function clock(){

}
