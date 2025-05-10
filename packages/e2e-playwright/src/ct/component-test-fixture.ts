import { test as baseTest } from '@playwright/experimental-ct-vue';
import { addCoverageToContext } from '../utils/coverage.js';
import type { BrowserContext } from '@playwright/test';
export { expect } from '@playwright/experimental-ct-vue';

interface CustomFixtures {
    context: BrowserContext;
}

// We are explicitly typing test because TS is unable to infer the correct type
// We are not adding any utility functions to the context, so simply typing it as baseTest should be fine.
export const test: typeof baseTest = baseTest.extend<CustomFixtures>({
    context: async ({ context }, use) => addCoverageToContext(context, use as (r: BrowserContext) => Promise<void>),
});
