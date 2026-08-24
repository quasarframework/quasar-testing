import { defineConfig } from "oxfmt";

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

  printWidth: 80,
  arrowParens: "avoid",
  bracketSpacing: true,
  bracketSameLine: false,
  htmlWhitespaceSensitivity: "strict",
  semi: true,
  singleQuote: false,
  quoteProps: "as-needed",
  trailingComma: "none",
  useTabs: false,
  vueIndentScriptAndStyle: false
});
