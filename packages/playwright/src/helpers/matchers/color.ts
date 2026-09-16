import {
  expect,
  type ExpectMatcherState,
  type Locator,
  type MatcherReturnType,
} from '@playwright/test';
import { runRetryingAssertion } from './retrying-assertion';

/*
  toHaveCSS() compares computed values as strings, and computed colors are
  always rgb()/rgba(). These matchers accept any CSS color and Quasar color
  names ("primary", "red-5") by resolving them in the page first.
*/

export interface ColorMatcherOptions {
  timeout?: number;
}

type ColorProperty = 'color' | 'background-color';

// Resolves the expected color in the page: Quasar names through the "text-<name>"
// class, anything else as an inline CSS color. Runs in the browser.
function resolveExpectedColor(expected: string) {
  // Quasar palette names look like "red", "red-5", "deep-purple", "deep-purple-6".
  const QUASAR_COLOR_NAME_PATTERN = /^[a-z]+(-[a-z]+)?(-\d{1,2})?$/;
  const SENTINEL_COLOR = 'rgb(1, 2, 3)';

  const parent = document.createElement('div');
  parent.style.display = 'none';
  parent.style.color = SENTINEL_COLOR;

  const probe = document.createElement('div');
  parent.appendChild(probe);
  document.body.appendChild(parent);

  // If a class or inline style does not resolve to a real color, the probe
  // inherits this computed value from the parent instead of getting its own.
  const sentinelColor = getComputedStyle(parent).color;
  const readProbeColor = () => getComputedStyle(probe).color;

  if (QUASAR_COLOR_NAME_PATTERN.test(expected)) {
    probe.className = `text-${expected}`;
    const resolvedFromQuasarClass = readProbeColor();

    // Quasar's palette uses Material Design values. "red" resolves to Quasar's
    // red. Quasar wins over the CSS named color when both exist.
    if (resolvedFromQuasarClass !== sentinelColor) {
      parent.remove();
      return resolvedFromQuasarClass;
    }

    probe.className = '';
  }

  probe.style.color = expected;
  const resolvedFromStyle = readProbeColor();
  parent.remove();

  if (resolvedFromStyle === sentinelColor) {
    throw new Error(
      `"${expected}" is neither a Quasar color name nor a CSS color`,
    );
  }

  return resolvedFromStyle;
}

async function colorMatcher(
  state: ExpectMatcherState,
  assertionName: string,
  property: ColorProperty,
  locator: Locator,
  expected: string,
  options: ColorMatcherOptions,
): Promise<MatcherReturnType> {
  // A JavaScript project gets no type error for the wrong receiver. A Locator
  // has both methods. An ElementHandle and a Page have evaluate() but no
  // page().
  const receiver = locator as Locator | undefined;
  if (
    typeof receiver?.evaluate !== 'function' ||
    typeof receiver.page !== 'function'
  ) {
    throw new Error(`${assertionName}() expects a Locator`);
  }

  const expectedComputed = await locator
    .page()
    .evaluate(resolveExpectedColor, expected);
  // The built-in assertion gets .not so it retries toward the outcome the test
  // asked for.
  const { pass, actual } = await runRetryingAssertion(state.isNot, () =>
    (state.isNot ? expect(locator).not : expect(locator)).toHaveCSS(
      property,
      expectedComputed,
      { timeout: state.timeout, ...options },
    ),
  );

  const message = () =>
    `${state.utils.matcherHint(assertionName, undefined, undefined, { isNot: state.isNot })}\n\n` +
    `Expected ${property} ${state.isNot ? 'not ' : ''}to be: ${state.utils.printExpected(expected)} (${expectedComputed})\n` +
    `Received: ${state.utils.printReceived(actual)}`;

  return {
    message,
    pass,
    name: assertionName,
    expected: expectedComputed,
    actual,
  };
}

export const colorMatchers = {
  /**
   * Asserts the element's text color, a Quasar palette name such as `primary`
   * or a CSS color.
   *
   * @example await expect(locator).toHaveColor('primary')
   */
  async toHaveColor(
    this: ExpectMatcherState,
    locator: Locator,
    expected: string,
    options: ColorMatcherOptions = {},
  ) {
    return colorMatcher(
      this,
      'toHaveColor',
      'color',
      locator,
      expected,
      options,
    );
  },

  /**
   * Asserts the element's background color, a Quasar palette name such as
   * `primary` or a CSS color.
   *
   * @example await expect(locator).toHaveBackgroundColor('#000')
   */
  async toHaveBackgroundColor(
    this: ExpectMatcherState,
    locator: Locator,
    expected: string,
    options: ColorMatcherOptions = {},
  ) {
    return colorMatcher(
      this,
      'toHaveBackgroundColor',
      'background-color',
      locator,
      expected,
      options,
    );
  },
};
