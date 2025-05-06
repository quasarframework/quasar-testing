import { test as baseTest } from '@playwright/experimental-ct-vue';
import { addCoverageToContext } from '../utils/coverage.js';
import { BrowserContext } from '@playwright/test';
export { expect } from '@playwright/experimental-ct-vue';

interface CustomFixtures {
    context: BrowserContext;
}

export const test = baseTest.extend<CustomFixtures>({
    context: async ({ context }, use) => addCoverageToContext(context, use),
});
