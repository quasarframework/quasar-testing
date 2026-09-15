import {
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { expect, onTestFinished, test } from 'vitest';
import { collectCoverage } from './coverage';

/** A Page that records what the collector does to it, with no browser. */
function createFakePage() {
  const initScripts: string[] = [];
  const evaluated: string[] = [];
  let exposed: ((json: string) => void) | undefined;
  let closed = false;

  return {
    initScripts,
    evaluated,
    close: () => {
      closed = true;
    },
    send: (json: string) => exposed?.(json),
    page: {
      exposeFunction: (_name: string, fn: (json: string) => void) => {
        exposed = fn;

        return Promise.resolve();
      },
      addInitScript: ({ content }: { content: string }) => {
        initScripts.push(content);

        return Promise.resolve();
      },
      isClosed: () => closed,
      evaluate: (script: string) => {
        evaluated.push(script);

        return Promise.resolve();
      },
    },
  };
}

function createAppDir() {
  const appDir = mkdtempSync(path.join(tmpdir(), 'coverage-'));
  onTestFinished(() => rmSync(appDir, { recursive: true, force: true }));

  return appDir;
}

test('writes the coverage next to the config file, not to the rootDir', async () => {
  const appDir = createAppDir();
  const fake = createFakePage();
  const testInfo = {
    config: {
      configFile: path.join(appDir, 'playwright.config.ts'),
      // What a project-level testDir leaves here, the directory nyc never reads
      rootDir: path.join(appDir, 'test/playwright'),
    },
  };

  await collectCoverage(
    fake.page as never,
    () => {
      fake.send(JSON.stringify({ 'src/App.vue': { path: 'src/App.vue' } }));

      return Promise.resolve();
    },
    testInfo as never,
  );

  const outputDir = path.join(appDir, '.nyc_output');
  const [written] = readdirSync(outputDir);

  expect(written).toMatch(/^playwright_.+\.json$/);
  expect(
    JSON.parse(readFileSync(path.join(outputDir, written ?? ''), 'utf8')),
  ).toStrictEqual({ 'src/App.vue': { path: 'src/App.vue' } });
  expect(readdirSync(appDir)).not.toContain('test');
});

test('writes nothing when the page sends no coverage', async () => {
  const appDir = createAppDir();
  const fake = createFakePage();

  await collectCoverage(
    fake.page as never,
    () => {
      fake.send('');

      return Promise.resolve();
    },
    {
      config: { configFile: path.join(appDir, 'playwright.config.ts') },
    } as never,
  );

  expect(readdirSync(appDir)).toStrictEqual([]);
});

test('registers a beforeunload collector on the page', async () => {
  const appDir = createAppDir();
  const fake = createFakePage();

  await collectCoverage(fake.page as never, () => Promise.resolve(), {
    config: { configFile: path.join(appDir, 'playwright.config.ts') },
  } as never);

  expect(fake.initScripts).toHaveLength(1);
  expect(fake.initScripts[0]).toContain('beforeunload');
  expect(fake.initScripts[0]).toContain('__quasarTestingCollectCoverage');
});

test('reads the final coverage after the test', async () => {
  const appDir = createAppDir();
  const fake = createFakePage();

  await collectCoverage(fake.page as never, () => Promise.resolve(), {
    config: { configFile: path.join(appDir, 'playwright.config.ts') },
  } as never);

  expect(fake.evaluated).toHaveLength(1);
  expect(fake.evaluated[0]).toContain('__coverage__');
});

test('reads nothing when the test closed the page', async () => {
  const appDir = createAppDir();
  const fake = createFakePage();

  await collectCoverage(
    fake.page as never,
    () => {
      fake.close();

      return Promise.resolve();
    },
    {
      config: { configFile: path.join(appDir, 'playwright.config.ts') },
    } as never,
  );

  expect(fake.evaluated).toStrictEqual([]);
});

test('a failed write does not fail the test', async () => {
  const appDir = createAppDir();
  const fake = createFakePage();

  // A file where the output directory belongs, so mkdirSync throws
  writeFileSync(path.join(appDir, '.nyc_output'), '');

  await expect(
    collectCoverage(
      fake.page as never,
      () => {
        fake.send('{}');

        return Promise.resolve();
      },
      {
        config: {
          configFile: path.join(appDir, 'playwright.config.ts'),
        },
      } as never,
    ),
  ).resolves.toBeUndefined();
});

test('collects the last page when the test body throws', async () => {
  const appDir = createAppDir();
  const fake = createFakePage();
  const failure = new Error('the test failed');

  await expect(
    collectCoverage(
      fake.page as never,
      () => {
        fake.send(JSON.stringify({ 'src/App.vue': { path: 'src/App.vue' } }));

        return Promise.reject(failure);
      },
      {
        config: { configFile: path.join(appDir, 'playwright.config.ts') },
      } as never,
    ),
  ).rejects.toBe(failure);

  // The failing test is the one a reader looks at first, so its page counts
  expect(fake.evaluated).toHaveLength(1);
  expect(readdirSync(path.join(appDir, '.nyc_output'))).toHaveLength(1);
});

test('collects nothing when a failing test closed the page', async () => {
  const appDir = createAppDir();
  const fake = createFakePage();

  await expect(
    collectCoverage(
      fake.page as never,
      () => {
        fake.close();

        return Promise.reject(new Error('the test failed'));
      },
      {
        config: { configFile: path.join(appDir, 'playwright.config.ts') },
      } as never,
    ),
  ).rejects.toThrow('the test failed');

  expect(fake.evaluated).toStrictEqual([]);
});
