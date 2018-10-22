const env = (process.env.TEST_ENV === 'bundle') ? 'From bundle': 'From source';
const hello = (process.env.TEST_ENV === 'bundle')
  ? require('../dist/lib.bundle.js')
  : require('../src/index.js');

const message = (process.env.TEST_ENV === 'bundle')
  ? '**This is a test with a bundled library in dist.**'
  : '**This is a test with source codes in src.**';

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

