import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  utimesSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { expect, onTestFinished, test } from 'vitest';
import { createStoryTypesPlugin } from './plugin';

const OLD_MTIME_SECONDS = 1000000000;

function createApp() {
  const appDir = mkdtempSync(path.join(tmpdir(), 'story-registry-plugin-'));
  onTestFinished(() => rmSync(appDir, { recursive: true, force: true }));
  const srcDir = path.join(appDir, 'src');
  const outFile = path.join(appDir, '.quasar/playwright.d.ts');

  mkdirSync(path.join(srcDir, 'components'), { recursive: true });
  writeFileSync(path.join(srcDir, 'components/Button.story.tsx'), '');

  return { appDir, srcDir, outFile, roots: [srcDir] };
}

function ageFile(file: string) {
  utimesSync(file, OLD_MTIME_SECONDS, OLD_MTIME_SECONDS);
}

test('writes the registry once and leaves an identical file alone', () => {
  const { appDir, outFile, roots } = createApp();

  const { generate } = createStoryTypesPlugin({ appDir, roots, outFile });
  generate();

  expect(readFileSync(outFile, 'utf8')).toMatch(/components\/Button/);
  ageFile(outFile);

  generate();

  expect(statSync(outFile).mtimeMs).toBe(OLD_MTIME_SECONDS * 1000);
});

test('rewrites the registry when the story files change', () => {
  const { appDir, srcDir, outFile, roots } = createApp();

  const { generate } = createStoryTypesPlugin({ appDir, roots, outFile });
  generate();
  ageFile(outFile);
  writeFileSync(path.join(srcDir, 'components/Card.story.vue'), '');

  generate();

  const content = readFileSync(outFile, 'utf8');
  expect(content).toMatch(/components\/Card/);
  expect(statSync(outFile).mtimeMs).not.toBe(OLD_MTIME_SECONDS * 1000);
});

test('regenerates on watcher events for story files only', () => {
  const { appDir, srcDir, outFile, roots } = createApp();

  const { plugin, generate } = createStoryTypesPlugin({
    appDir,
    roots,
    outFile,
  });
  const events: string[] = [];
  const listeners: Array<(file: string) => void> = [];
  plugin.configureServer({
    watcher: {
      on: (event, listener) => {
        events.push(event);
        return listeners.push(listener);
      },
    },
  });

  expect(events).toStrictEqual(['add', 'unlink']);

  generate();
  ageFile(outFile);
  writeFileSync(path.join(srcDir, 'components/Card.story.vue'), '');

  for (const listener of listeners) {
    listener(path.join(srcDir, 'components/README.md'));
  }
  expect(statSync(outFile).mtimeMs).toBe(OLD_MTIME_SECONDS * 1000);

  for (const listener of listeners) {
    listener(path.join(srcDir, 'components/Card.story.vue'));
  }
  expect(readFileSync(outFile, 'utf8')).toMatch(/components\/Card/);
});
