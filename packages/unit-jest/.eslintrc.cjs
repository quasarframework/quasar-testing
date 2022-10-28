module.exports = {
  overrides: [
    {
      files: [
        // Note there's an additional underscore for `__tests__` folder here
        // compared to the users need to add in their own projects,
        // due to the templating process automatically removing the first underscore to every filename, if present.
        '**/test/jest/___tests__/**/*.{spec,test}.{js,jsx,ts,tsx}',
        '**/*.jest.{spec,test}.{js,jsx,ts,tsx}',
      ],
      env: {
        browser: true,
      },
      extends: [
        // Removes 'no-undef' lint errors for Jest global functions (`describe`, `it`, etc),
        //  add Jest-specific lint rules and Jest plugin
        // See https://github.com/jest-community/eslint-plugin-jest#recommended
        'plugin:jest/recommended',
        // Uncomment following line to apply style rules
        'plugin:jest/style',
      ],
    },
  ],
};
