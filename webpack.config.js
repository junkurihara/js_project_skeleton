/**
 * webpack.config.js
 */
const libconf = require('./jslib.config.js');
const path = require('path');
const fs = require('fs');
const webpack = require('webpack');

// port babelrc from .babelrc
const getBabelWebOpt = () => {
  const pluginExclude = []; // add here node-specific plugins
  const envBrowserTargets = [
    'last 2 chrome versions',
    'last 2 firefox versions',
    'IE 11',
    'last 2 Edge versions'
  ];
  const babelrc = JSON.parse(fs.readFileSync('./.babelrc', 'utf8'));
  babelrc.babelrc = false;
  babelrc.presets = babelrc.presets.map( (elem) => {
    if (elem instanceof Array){
      if(elem[0] === '@babel/preset-env'){
        elem[1].targets.browsers = envBrowserTargets;
        elem[1].modules = false; // for browsers. if true, import statements will be transpiled to CommonJS 'require', and webpack tree shaking doesn't work.
      }
    }
    return elem;
  });
  babelrc.plugins = babelrc.plugins.filter( (elem) => pluginExclude.indexOf(elem) < 0);
  return babelrc;
};

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
          options: getBabelWebOpt()
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

module.exports = (env, argv) => {
  //////////////////
  // to build library
  const config = webConfig;
  config.entry[libconf.libraryName] = [libconf.entry];

  if (argv.mode === 'development'){
    config.devtool = 'inline-source-map'; // add inline source map
  }
  else if(argv.mode === 'production'){
    config.output.filename = `[name].${libconf.bundleSuffix}.${libconf.minimizeSuffix}.js`;
  }

  //////////////////
  // to build test bundle
  // when TEST_ENV is set, only test bundle is generated
  // this is only the case where the bundled js files are generated for test using html file.
  if(process.env.TEST_ENV){
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

    // TODO: Edit HTML here
  }

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