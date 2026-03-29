import importDir from "../lib/index.js";
const __dirname = new URL(".", import.meta.url).pathname;

// Import all modules from the `operations` directory
const operations = await importDir(`${__dirname}/operations`);

console.log(operations.sum(40, 2));
// => 42

console.log(operations.multiply(21, 2));
// => 42

console.log(operations.divide(84, 2));
// => 42

console.log(operations.constants);
// => { first_name: 'Johnny', last_name: 'B.', favorite_number: 42 }

console.log(operations.meta);
// => { favorite_color: 'blue', favorite_animal: 'owl' }