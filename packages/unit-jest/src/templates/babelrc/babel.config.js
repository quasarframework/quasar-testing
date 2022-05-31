/* eslint-disable */
const fs = require('fs');
let extend = undefined;

/**
 * The .babelrc file has been created to assist Jest for transpiling.
 * You should keep your application's babel rules in this file.
 */

if (fs.existsSync('./.babelrc')) {
  extend = './.babelrc';
}

module.exports = (api) => {
  return {
    presets: [
      [
        '@quasar/babel-preset-app',
        api.caller((caller) => caller && caller.target === 'node')
          ? { targets: { node: 'current' } }
          : {},
      ],
    ],
    extends: extend,
  };
};
