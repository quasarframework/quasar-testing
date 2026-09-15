import { expect, test } from 'vitest';
import { runRetryingAssertion } from './retrying-assertion';

/** What Playwright throws when a built-in assertion fails. */
function assertionFailure(actual: string) {
  return Object.assign(new Error('expect(locator).toHaveCSS failed'), {
    matcherResult: { actual },
  });
}

test('reports a pass when the assertion resolves', async () => {
  await expect(
    runRetryingAssertion(false, () => Promise.resolve()),
  ).resolves.toStrictEqual({ pass: true, actual: undefined });
});

test('flips the pass when isNot is set', async () => {
  await expect(
    runRetryingAssertion(true, () => Promise.resolve()),
  ).resolves.toStrictEqual({ pass: false, actual: undefined });
});

test('reads the actual value off an assertion failure', async () => {
  await expect(
    runRetryingAssertion(false, () =>
      Promise.reject(assertionFailure('rgb(1, 2, 3)')),
    ),
  ).resolves.toStrictEqual({ pass: false, actual: 'rgb(1, 2, 3)' });

  await expect(
    runRetryingAssertion(true, () =>
      Promise.reject(assertionFailure('rgb(1, 2, 3)')),
    ),
  ).resolves.toStrictEqual({ pass: true, actual: 'rgb(1, 2, 3)' });
});

test('rethrows an error that is not an assertion failure', async () => {
  const closed = new Error('Target page, context or browser has been closed');

  // Without matcherResult this is not an assertion outcome. Reporting it as one
  // would pass a negated assertion against a closed page.
  await expect(
    runRetryingAssertion(true, () => Promise.reject(closed)),
  ).rejects.toBe(closed);

  await expect(
    runRetryingAssertion(false, () => Promise.reject(closed)),
  ).rejects.toBe(closed);
});
