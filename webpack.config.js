/**
 * webpack.config.js
 */
const libconf = require('./webpack.common.js'); // TODO webpackに統一したい。webpack.config.jsをdev/prod/testなどで分割するついでに対応？
const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const ShakePlugin = require('webpack-common-shake').Plugin;

// webpack main configration
const webConfig = {
  target: 'web',
  entry: {},
  output: {
    filename: `[name].${libconf.bundleSuffix}.js`,
    chunkFilename: '[name].js',
    path: path.resolve(__dirname, './dist'),
    publicPath: path.resolve(__dirname, './dist'),
    library: libconf.libraryName,
    libraryTarget: 'umd',
    globalObject: 'this' // for node js import
  },
  resolve: {
    extensions: ['.mjs', '.jsx', '.js'],
    modules: ['node_modules']
  },
  module: {
    rules: [
      {
        test: /\.(m|)js$/,
        use: [{
          loader: 'babel-loader',
          options: getBabelOptionsForWebpack()
        }],
        exclude: path.join(__dirname, 'node_modules') // exclude: /node_modules/
      }
    ]
  },
  plugins:[
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1
    }),
    new webpack.optimize.MinChunkSizePlugin({minChunkSize: 1000}),
    new webpack.DefinePlugin({
      'process.env': {
        // NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        TEST_ENV: JSON.stringify(process.env.TEST_ENV),
      }
    })
  ],
  node: {
    fs: 'empty'
  }
};

// export main configuration adjusted to various environments
module.exports = (env, argv) => {
  ////////////////////////////////////////////////////////////////////////
  // library build setting
  const config = webConfig;
  config.entry[libconf.libraryName] = [libconf.entry];

  if (argv.mode === 'development'){
    config.devtool = 'inline-source-map'; // add inline source map
  }
  else if(argv.mode === 'production'){
    config.output.filename = `[name].${libconf.bundleSuffix}.min.js`;
    config.plugins.push( new ShakePlugin() );
  }

  ////////////////////////////////////////////////////////////////////////
  // test bundle build setting
  // when TEST_ENV is set, only test bundle is generated
  // this is only the case where the bundled js files are generated for test using html file.
  if(process.env.TEST_ENV){
    config.entry = getEntriesForHTMLTest(config);
    // TODO: Edit HTML here
  }

  // for require through dynamic variables in webpack
  const entry = libconf.entry.split('/').slice(-1)[0];
  const bundle = `${libconf.libraryName}.${libconf.bundleSuffix}.js`;

  config.plugins.push(
    new webpack.ContextReplacementPlugin(
      RegExp('./src'), RegExp(entry)// only src/index.js is allowed to get imported.
    ),
    new webpack.ContextReplacementPlugin(
      RegExp('./dist'), RegExp(bundle)// only dist/xxx.bundle.js is allowed to get imported.
    )
  );

  return config;
};

// port babelrc from .babelrc
function getBabelOptionsForWebpack() {
  const pluginExclude = []; // add here node-specific plugins
  const babelrc = JSON.parse(fs.readFileSync('./.babelrc', 'utf8'));
  babelrc.babelrc = false;
  babelrc.presets = babelrc.presets.map( (elem) => {
    if (elem instanceof Array && elem.length > 0){
      // for browsers. if true, import statements will be transpiled to CommonJS 'require', and webpack tree shaking doesn't work.
      if(elem[0] === '@babel/preset-env') elem[1].modules = false;
    }
    return elem;
  });
  babelrc.plugins = babelrc.plugins.filter( (elem) => pluginExclude.indexOf(elem) < 0);
  return babelrc;
}

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