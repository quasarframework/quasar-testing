import { randomUUID } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { Page, TestInfo } from '@playwright/test';

/*
  Istanbul coverage collector. vite-plugin-istanbul exposes window.__coverage__.
  Every navigation resets it, so the page sends it before unloading, and the
  fixture reads the final state after the test. Without instrumentation both
  paths find no window.__coverage__ and do nothing.

  It registers on the page, not on the context, so it works with reuseContext.
  Playwright removes bindings and init scripts between tests.
*/

const COLLECT_FUNCTION_NAME = '__quasarTestingCollectCoverage';
const OUTPUT_DIR_NAME = '.nyc_output';
const OUTPUT_FILE_PREFIX = 'playwright_';

// Runs in the browser. Plain source text, shared by the init script and the
// final evaluate() call.
const collectCoverageScript = `
  (() => {
    const coverage = window.__coverage__;
    const collect = window['${COLLECT_FUNCTION_NAME}'];
    if (coverage === undefined || typeof collect !== 'function') {
      return;
    }
    collect(JSON.stringify(coverage));
  })()
`;

export async function collectCoverage(
  page: Page,
  use: () => Promise<void>,
  testInfo: TestInfo,
) {
  // testInfo.config.rootDir is the top-level testDir when the config sets one,
  // and the config directory otherwise. Anchoring on the config file keeps the
  // output where nyc looks either way.
  const configDir = testInfo.config.configFile
    ? path.dirname(testInfo.config.configFile)
    : process.cwd();
  const outputDir = path.join(configDir, OUTPUT_DIR_NAME);

  await page.exposeFunction(COLLECT_FUNCTION_NAME, (coverageJson: string) => {
    if (!coverageJson) {
      return;
    }

    const outputFile = path.join(
      outputDir,
      `${OUTPUT_FILE_PREFIX}${randomUUID()}.json`,
    );

    try {
      mkdirSync(outputDir, { recursive: true });
      writeFileSync(outputFile, coverageJson);
    } catch (error) {
      console.warn(
        `quasar-testing: failed to write coverage to ${outputFile}: ${String(error)}`,
      );
    }
  });

  await page.addInitScript({
    content: `window.addEventListener('beforeunload', () => { ${collectCoverageScript} });`,
  });

  try {
    await use();
  } finally {
    // A failing test still ran code, and its last page is the one a reader
    // looks at first. The test itself may have closed the page, and then there
    // is nothing left to collect.
    if (!page.isClosed()) {
      await page.evaluate(collectCoverageScript);
    }
  }
}
