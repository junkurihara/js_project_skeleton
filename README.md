Project Skeleton for JavaScript Library Development 
--

> **WARNING**: At this time this solution should be considered suitable for research and experimentation, further code and security review is needed before utilization in a production application.

# Usage
Just clone this repo, remove `.git`, and edit `package.json`, `webpack.config.js`, `karma.conf.js` and whatever for your project.

## Npm commands
By specifying `:bundled` as a suffix of each test commands, i.e, `test` and `karma`, the test would be done with the **bundled library** `dist/testlib.bundled.js`. Note that by plain commands, tests will be executed by importing from `src/index.js`. These tests should be done considering use cases of public library. Namely, the universal library is expected to be used by various ways of importing and executing, like ones from babel-ed sources (`dist/index.js`), from one bundle file (`dist/testlib.bundle.js`), on Node.js, and on browsers through a certain bundlers. Also you can test the case where the bundled library is imported as a part of `window`, i.e., `window.testlib`.

```shell
// Test for node.js with mocha.
$ npm run test
$ npm run test:bundled // test with `dist/testlib.bundle.js`
 
// Test for browsers (headless chrome) with Karma.
$ npm run karma
$ npm run karma:bundle // test with `dist/testlib.bundle.js`
$ npm run karma:bundle // test with `window.testlib`

// Generate bandled test files (not library) for compatibility test on various browsers.
// open ./test/html/test.html with your intended browser after executing this command.
// This generate test-bundles simultaneously from `src/index.js`, `dist/testlib.bundle.js`
// and `window.testlib`.
$ npm run html

// Execute babel and output transpiled JS files to ./dist,
// and create their bandle file via webpack.
// This also removes console.log in source codes.
$ npm run build
```

# License
Licensed under the MIT license, see `LICENSE` file.