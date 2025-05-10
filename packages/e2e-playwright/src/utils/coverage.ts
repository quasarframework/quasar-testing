import * as fs from 'fs';
import * as crypto from 'crypto';
import * as path from 'path';
import { type BrowserContext } from '@playwright/test';

// We may want to provide a means by which the user can use an alternative path
const NYC_OUTPUT_DIR = path.join(process.cwd(), '.nyc_output');

function generateUUID() {
  return crypto.randomBytes(16).toString('hex');
}

export async function addCoverageToContext(context: BrowserContext, use: (r: BrowserContext) => Promise<void>) {
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

  // Collect coverage from all pages after tests
  for (const page of context.pages()) {
    await page.evaluate(
      () => {
        window.collectIstanbulCoverage?.(JSON.stringify(window.__coverage__));
      });
  }
}