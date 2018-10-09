/**
 * index.js
 */

export function hello(){
  console.log('hello'); // this will be removed in 'yarn build' and 'yarn webpack'
  return 'hello world';
}

export default {hello}; // both export and export default needs to be declared for compatibility on node and browser.