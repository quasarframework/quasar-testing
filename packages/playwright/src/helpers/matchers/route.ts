import {
  expect,
  type ExpectMatcherState,
  type MatcherReturnType,
  type Page,
} from '@playwright/test';
import { runRetryingAssertion } from './retrying-assertion';
import { matchesRoute } from './route-match';

export interface RouteMatcherOptions {
  timeout?: number;
}

export const routeMatchers = {
  /**
   * Asserts that the current route matches the glob, e.g. `toHaveRoute('books/*')`.
   * Hash-mode routers are detected automatically.
   */
  async toHaveRoute(
    this: ExpectMatcherState,
    page: Page,
    glob: string,
    options: RouteMatcherOptions = {},
  ): Promise<MatcherReturnType> {
    const assertionName = 'toHaveRoute';

    // A JavaScript project gets no type error for the wrong receiver.
    if (typeof (page as Page | undefined)?.url !== 'function') {
      throw new Error(`${assertionName}() expects a Page`);
    }

    const { pass, actual } = await runRetryingAssertion(this.isNot, () =>
      (this.isNot ? expect(page).not : expect(page)).toHaveURL(
        (url) => matchesRoute(url, glob),
        { timeout: this.timeout, ...options },
      ),
    );

    const message = () =>
      `${this.utils.matcherHint(assertionName, undefined, undefined, { isNot: this.isNot })}\n\n` +
      `Expected route ${this.isNot ? 'not ' : ''}to match: ${this.utils.printExpected(glob)}\n` +
      `Received URL: ${this.utils.printReceived(actual ?? page.url())}`;

    return { message, pass, name: assertionName, expected: glob, actual };
  },
};
