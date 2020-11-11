module.exports = {
  root: true,

  env: {
    node: true,
    es6: true, // Allows for the parsing of modern ECMAScript features
  },

  parserOptions: {
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
  },

  extends: [
    // Base ESLint recommended rules
    'eslint:recommended',

    // https://github.com/prettier/eslint-config-prettier#installation
    // usage with Prettier, provided by 'eslint-config-prettier'.
    'prettier',
  ],

  plugins: [
    // Prettier has not been included as plugin to avoid performance impact
    // add it as an extension for your IDE
  ],

  globals: {
    process: true,
  },

  // add your custom rules here
  rules: {
    'prefer-promise-reject-errors': 'off',

    // allow debugger during development only
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
  },
};
