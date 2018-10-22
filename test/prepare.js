/**
 * prepare.js
 */
const libconf = require('../jslib.config.js');

const entry = libconf.entry.split('/').slice(-1)[0];
const bundle = `${libconf.libraryName}.${libconf.bundleSuffix}.js`;

const libSrc = require(`../src/${entry}`);
const libBundle = require(`../dist/${bundle}`);

export function getTestEnv(){
  let envName;
  let message;
  let library;
  if(process.env.TEST_ENV === 'bundle'){
    envName = 'Bundle';
    message = '**This is a test with a bundled library';
    library = libBundle;
  }
  else if (process.env.TEST_ENV === 'window'){
    if(typeof window !== 'undefined' && typeof window[libconf.libraryName] !== 'undefined'){
      envName = 'Window';
      library = window[libconf.libraryName];
      message = '**This is a test with a library imported from window.**';
    }
    else{
      envName = 'Source (Not Window)';
      library = libSrc;
      message = '**This is a test with source codes in src.**';
    }
  }
  else {
    envName = 'Source';
    library = libSrc;
    message = '**This is a test with source codes in src.**';

  }

  return {library, envName, message};
}
