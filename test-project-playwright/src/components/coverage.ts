import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as libCoverage from 'istanbul-lib-coverage';
import { test as baseTest } from '@playwright/experimental-ct-vue';

// Define paths
const NYC_OUTPUT_DIR: string = path.join(process.cwd(), '.nyc_output');
const MERGED_COVERAGE_FILE: string = path.join(NYC_OUTPUT_DIR, 'merged-coverage.json');

// Ensure .nyc_output exists
if (!fs.existsSync(NYC_OUTPUT_DIR)) {
  fs.mkdirSync(NYC_OUTPUT_DIR, { recursive: true });
}

// Generate UUID for unique coverage file names
export function generateUUID(): string {
  return crypto.randomBytes(16).toString('hex');
}

// Merge coverage files in .nyc_output
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function mergeCoverageFiles() {
  try {
    const coverageMap: libCoverage.CoverageMap = libCoverage.createCoverageMap({});

    // Read and merge all .json files in .nyc_output
    const files = fs.readdirSync(NYC_OUTPUT_DIR).filter((file: string) => file.endsWith('.json'));
    for (const file of files) {
      const filePath: string = path.join(NYC_OUTPUT_DIR, file);
      try {
        const coverage: libCoverage.CoverageMapData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        coverageMap.merge(coverage);
      } catch (error) {
        console.error(`Error processing file ${filePath}:`, error);
      }
    }

    // Write merged coverage to file
    if (Object.keys(coverageMap.data).length > 0) {
      fs.writeFileSync(MERGED_COVERAGE_FILE, JSON.stringify(coverageMap.data, null, 2));
      console.log(`Merged coverage written to ${MERGED_COVERAGE_FILE}`);
    } else {
      console.warn('No coverage data found to merge');
    }
  } catch (error) {
    console.error('Error merging coverage files:', error);
  }
}

export const test = baseTest.extend({
  context: async ({ context }, use) => {
    // Add beforeunload listener to collect coverage
    await context.addInitScript(() =>
      window.addEventListener('beforeunload', () =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).collectIstanbulCoverage(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          JSON.stringify((window as any).__coverage__),
        ),
      ),
    );

    // Ensure .nyc_output directory exists
    await fs.promises.mkdir(NYC_OUTPUT_DIR, { recursive: true });

    // Expose function to save coverage from browser
    await context.exposeFunction('collectIstanbulCoverage', (coverageJSON: string) => {
      if (coverageJSON) {
        const filePath = path.join(NYC_OUTPUT_DIR, `playwright_coverage_${generateUUID()}.json`);
        fs.writeFileSync(filePath, coverageJSON);
        console.log(`Coverage saved to ${filePath}`);
      } else {
        console.log('No coverage data received');
      }
    });

    // Use the context for tests
    await use(context);

    // Collect coverage from all pages after tests
    for (const page of context.pages()) {
      try {
        await page.evaluate(() =>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window as any).collectIstanbulCoverage(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            JSON.stringify((window as any).__coverage__),
          ),
        );
      } catch (error) {
        console.error('Error collecting coverage from page:', error);
      }
    }

    // // Merge coverage files after tests
    // await mergeCoverageFiles();
  },
});

export { expect } from '@playwright/experimental-ct-vue';
