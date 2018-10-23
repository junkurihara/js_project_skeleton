/**
 * webpack.dev.js
 */
const common = require('./webpack.common.js');
const fs = require('fs');
const webpack = require('webpack');
const merge = require('webpack-merge');

// webpack main configration
const webpackConfig = {
  mode: 'development',
  plugins:[
    new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),
    new webpack.optimize.MinChunkSizePlugin({minChunkSize: 1000}),
    new webpack.DefinePlugin({
      'process.env': {
        TEST_ENV: JSON.stringify(process.env.TEST_ENV),
      }
    })
  ],
  devtool: 'inline-source-map' // add inline source map
};

// export main configuration adjusted to various environments
module.exports = (env, argv) => {
  if (argv.mode !== 'development') throw new Error('Not development mode!!');
  ////////////////////////////////////////////////////////////////////////
  // library build setting
  const config = merge.smart(common.webpackConfig, webpackConfig);

  ////////////////////////////////////////////////////////////////////////
  // test bundle build setting
  if(process.env.TEST_ENV){

    // when NODE_ENV = test is set, only test bundles are generated.
    // this is only the case where the bundled js files are generated for test using html file.
    // NOTE Karma does not refer to config.entry, and it pre-process the spec files written in karma.conf.js
    if(process.env.NODE_ENV === 'test'){
      config.entry = getEntriesForHTMLTest(config);
      // TODO: Edit HTML here
    }

    // for require through dynamic variables in webpack
    config.plugins.push(
      new webpack.ContextReplacementPlugin(
        RegExp('./src'), RegExp(common.entryName)// only src/index.js is allowed to get imported.
      ),
      new webpack.ContextReplacementPlugin(
        RegExp('./dist'), RegExp(common.bundleName)// only dist/xxx.bundle.js is allowed to get imported.
      )
    );
  }

  return config;
};

// get test file names for test with static html
function getEntriesForHTMLTest (config) {
  const parentDir = './test';
  const files = fs.readdirSync(parentDir);
  const testFileRegExp = new RegExp('.*\\.spec\\.js$');
  const testFiles = files.filter((file) => fs.statSync(`${parentDir}/${file}`).isFile() && testFileRegExp.test(file));

  config.entry = {};
  testFiles.map( (file) => {
    const prefix = file.slice(0, -8);
    config.entry[`.${parentDir}/html/${prefix}`] = [ `${parentDir}/${file}` ];
  });

  if(process.env.TEST_ENV === 'bundle'){
    const newEntry = {};
    Object.keys(config.entry).map( (key) => {
      const newKey = `${key}.fromBundled`;
      newEntry[newKey] = config.entry[key];
    });
    config.entry = newEntry;
  }
  else if(process.env.TEST_ENV === 'window'){
    const newEntry = {};
    Object.keys(config.entry).map( (key) => {
      const newKey = `${key}.fromWindow`;
      newEntry[newKey] = config.entry[key];
    });
    config.entry = newEntry;
  }
  return config.entry;
}