//////////////
// preparation
const bunMsg = '**This is a test with a bundled library';
const winMsg = '**This is a test with a library imported from window.**';
const srcMsg = '**This is a test with source codes in src.**';

let env;
let message;
let hello; // todo: change library name
if(process.env.TEST_ENV === 'bundle'){
  env = 'From bundle';
  message = bunMsg;
  hello = require('../dist/testlib.bundle.js'); // todo: change library name
}
else if (process.env.TEST_ENV === 'window'){
  env = 'From window';
  if(typeof window !== 'undefined' && typeof window.testlib !== 'undefined'){
    hello = window.testlib; // todo: change library name
    message = winMsg;
  }
  else{
    hello = require('../src/index.js');
    message = srcMsg;
  }
}
else {
  env = 'From source';
  message = srcMsg;
  hello = require('../src/index.js');
}
//////////////

import chai from 'chai';
// const should = chai.should();
const expect = chai.expect;


describe(`${env}: Test skeleton`, () => {
  before( async () => {
    console.log(message);
  });

  it('Test', async () => {
    const val = hello.hello();
    expect(val === 'hello world').to.be.true;
  });

});

