import hello from '../src/index.js';

import chai from 'chai';
// const should = chai.should();
const expect = chai.expect;


describe('Test skeleton', () => {
  before( async () => {
  });

  it('Test', async () => {
    const val = hello.hello();
    expect(val === 'hello world').to.be.true;
  });

});

