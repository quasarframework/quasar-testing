import { defineConfig } from "oxlint";

export default defineConfig({
  ignorePatterns: [
    "**/node_modules/",
    "dist/",
    "quasar.config.*.temporary.compiled*",
    ".quasar/",
    "src-cordova/",
    "src-capacitor/",
    "src/router/typed-router.d.ts"
  ],

  options: {
    typeAware: true,
    typeCheck: true,
    maxWarnings: 10
  },

  plugins: ["typescript", "vue", "import", "eslint", "promise", "unicorn"],

  categories: {
    correctness: "error"
    // style: 'error',
    // pedantic: 'warn',
    // suspicious: 'error',
    // perf: 'error',
    // restriction: 'error'
  },

  rules: {},

  env: {
    builtin: true
  }
});
