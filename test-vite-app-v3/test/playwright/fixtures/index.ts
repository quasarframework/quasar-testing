import {
  expect as quasarExpect,
  test as quasarTest
} from "@quasar/quasar-app-extension-testing-playwright";

// Every spec imports test and expect from this file. Extend test here with
// the app's own fixtures and expect with the app's own matchers.
// See https://playwright.dev/docs/test-fixtures
// and https://playwright.dev/docs/test-assertions#add-custom-matchers-using-expectextend
export const test = quasarTest;
export const expect = quasarExpect;
