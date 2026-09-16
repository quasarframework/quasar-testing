/*
  Every matcher of this package wraps a built-in Playwright assertion. The
  built-in one retries on its own. Each matcher reads the actual value off a
  failure and flips the result when isNot is set.
*/

interface MatcherError {
  matcherResult?: { actual?: string };
}

// Playwright marks an assertion failure by attaching matcherResult. A closed
// page, a detached frame and a navigation throw without it, and those are
// errors rather than assertion outcomes.
function assertionResultOf(error: unknown) {
  return (error as MatcherError).matcherResult;
}

interface RetryingAssertionResult {
  pass: boolean;
  /** What the built-in assertion saw, absent when it passed. */
  actual: string | undefined;
}

/** Runs a retrying built-in assertion and reports how it went, isNot applied. */
export async function runRetryingAssertion(
  isNot: boolean,
  assert: () => Promise<void>,
): Promise<RetryingAssertionResult> {
  try {
    await assert();

    return { pass: !isNot, actual: undefined };
  } catch (error) {
    const matcherResult = assertionResultOf(error);
    if (matcherResult === undefined) {
      throw error;
    }

    return { pass: isNot, actual: matcherResult.actual };
  }
}
