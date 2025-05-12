import * as fs from 'fs';
import * as crypto from 'crypto';
import * as path from 'path';
import { type BrowserContext } from '@playwright/test';

// We may want to provide a means by which the user can use an alternative path
const NYC_OUTPUT_DIR = path.join(process.cwd(), '.nyc_output');

function generateUUID() {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Sets up and collects code coverage for the given Playwright browser context.
 * Coverage collection is conditionally enabled based on the `VITE_COVERAGE` environment variable.
 *
 * The function performs the following steps when coverage is enabled:
 * 1. Adds an initialization script to the browser context. This script runs before
 * every page load within the context and attaches a 'beforeunload' event listener
 * to the browser's `window`. This listener attempts to capture the `window.__coverage__`
 * object (standard for Istanbul/v8 coverage) and send it back to Node.js
 * via an exposed function before the page unloads.
 * 2. Creates the output directory for coverage reports on the Node.js file system.
 * 3. Exposes a Node.js function named `collectIstanbulCoverage` to the browser's `window` object.
 * When this browser-side function is called (by the init script or later `page.evaluate` calls),
 * the corresponding Node.js function executes, receiving the coverage JSON string
 * and writing it to a unique JSON file in the designated output directory.
 * 4. Executes the main test logic provided by the `use` function.
 * 5. After the main test logic completes, it iterates through all pages currently open
 * in the context and explicitly evaluates a script on each. This script manually
 * calls the exposed `window.collectIstanbulCoverage` function to ensure any remaining
 * coverage data from pages that didn't trigger 'beforeunload' (e.g., tests that
 * finished without navigation or closing the page) is collected.
 *
 * @param context The Playwright browser context for which to collect coverage.
 * @param use The Playwright test fixture's `use` function,
 * which is called to execute the main test body with the configured context.
 */

// @link https://github.com/anishkny/playwright-test-coverage
export async function addCoverageToContext(context: BrowserContext, use: (_: BrowserContext) => Promise<void>) {
  if (process.env.VITE_COVERAGE !== 'true') {
    // `requireEnv` of istanbul should also prevent instrumentation if this flag is not set. So even if 
    // we remove this check, the coverage will not be collected if the flag is not set.
    // Let's ignore the rest of the code since coverage is disabled.
    return use(context);
  }

  // Add beforeunload listener to collect coverage
  await context.addInitScript(
    () => {
      window.addEventListener('beforeunload', () => {
        window.collectIstanbulCoverage?.(JSON.stringify(window.__coverage__));
      });
    });

  await fs.promises.mkdir(NYC_OUTPUT_DIR, { recursive: true });

  // Expose function to save coverage from browser
  await context.exposeFunction(
    'collectIstanbulCoverage',
    (coverageJSON: string) => {
      if (!coverageJSON) {
        return;
      }
      fs.writeFileSync(
        path.join(
          NYC_OUTPUT_DIR,
          `playwright_coverage_${generateUUID()}.json`,
        ),
        coverageJSON,
      );
    },
  );

  await use(context);

  // Goes through all browser pages in the page context and collects the coverage using the exposed function.
  for (const page of context.pages()) {
    await page.evaluate(
      () => {
        window.collectIstanbulCoverage?.(JSON.stringify(window.__coverage__));
      });
  }
}