Project Skeleton for JavaScript Library Development 
--

> **WARNING**: At this time this solution should be considered suitable for research and experimentation, further code and security review is needed before utilization in a production application.

# Usage
Just clone this repo, remove `.git`, and edit `package.json`, `webpack.config.js` and whatever for your project.

## Npm commands
```shell
// test for node.js with mocha.
$ npm run test

// test for browsers (headless chrome) with Karma.
$ npm run karma

// generate bandled test files (not library)
// for compatibility test on various browsers.
// open ./test/test.html with your intended browser after executing this command.
$ npm run browser

// Execute babel and output transpiled JS files to ./dist,
// and create their bandle file via webpack.
// This also removes console.log in source codes.
$ npm run build
```

# License
Licensed under the MIT license, see `LICENSE` file.