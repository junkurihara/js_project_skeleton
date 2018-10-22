import chai from 'chai';
// const should = chai.should();
const expect = chai.expect;

import {getTestEnv} from './prepare.js';
const env = getTestEnv();
const hello = env.library;
const message = env.message;
const envName = env.envName;

describe(`${envName}: Test skeleton`, () => {
  before( async () => {
    console.log(message);
  });

  it('Test', async () => {
    const val = hello.hello();
    expect(val === 'hello world').to.be.true;
  });

});

