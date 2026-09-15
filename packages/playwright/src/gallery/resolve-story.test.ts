import { expect, test } from 'vitest';
import { locateStory, resolveStory, storyFileId } from './resolve-story';

const files = [
  'src/components/Button.story.ts',
  'src/components/Button.primary.story.vue',
  'src/pages/admin/Users.story.js',
  'test/playwright/demo/QuasarSelect.story.tsx',
];

test('derives the file id from the path under src', () => {
  expect(storyFileId('src/components/Button.story.ts')).toBe(
    'components/Button',
  );
  expect(storyFileId('src/components/Button.primary.story.vue')).toBe(
    'components/Button.primary',
  );
  expect(storyFileId('src/pages/Home.story.js')).toBe('pages/Home');
});

test('keeps the full path for a story outside src', () => {
  expect(storyFileId('test/playwright/demo/QuasarSelect.story.tsx')).toBe(
    'test/playwright/demo/QuasarSelect',
  );
});

test('locates a named export by full id and by trailing suffix', () => {
  expect(locateStory(files, 'components/Button/Primary')).toStrictEqual({
    file: 'src/components/Button.story.ts',
    exportName: 'Primary',
  });
  expect(locateStory(files, 'Button/Primary')).toStrictEqual({
    file: 'src/components/Button.story.ts',
    exportName: 'Primary',
  });
  expect(locateStory(files, 'admin/Users/Default')).toStrictEqual({
    file: 'src/pages/admin/Users.story.js',
    exportName: 'Default',
  });
});

test('locates a demo story by its full id and by trailing suffix', () => {
  expect(
    locateStory(files, 'test/playwright/demo/QuasarSelect/Default'),
  ).toStrictEqual({
    file: 'test/playwright/demo/QuasarSelect.story.tsx',
    exportName: 'Default',
  });
  expect(locateStory(files, 'QuasarSelect/Default')).toStrictEqual({
    file: 'test/playwright/demo/QuasarSelect.story.tsx',
    exportName: 'Default',
  });
});

test('locates a single-file-component story by its path alone', () => {
  expect(locateStory(files, 'components/Button.primary')).toStrictEqual({
    file: 'src/components/Button.primary.story.vue',
    exportName: 'default',
  });
});

test('returns undefined for unknown ids', () => {
  expect(locateStory(files, 'components/Missing/Primary')).toBe(undefined);
  expect(locateStory(files, 'Missing')).toBe(undefined);
});

test('throws when a suffix id matches files in more than one folder', () => {
  const ambiguousFiles = [
    'src/components/Button.story.ts',
    'src/pages/Button.story.ts',
  ];

  expect(() => locateStory(ambiguousFiles, 'Button/Primary')).toThrow(
    /Ambiguous story id "Button\/Primary"/,
  );
});

test('throws when a whole-id match and a split match resolve to different files', () => {
  const conflictingFiles = [
    'src/components/Button/Primary.story.vue',
    'src/components/Button.story.ts',
  ];

  expect(() =>
    locateStory(conflictingFiles, 'components/Button/Primary'),
  ).toThrow(/Ambiguous story id "components\/Button\/Primary"/);
});

test('resolves a whole-id match that has no conflicting split candidate', () => {
  const singleFile = ['src/components/Button/Primary.story.vue'];

  expect(locateStory(singleFile, 'components/Button/Primary')).toStrictEqual({
    file: 'src/components/Button/Primary.story.vue',
    exportName: 'default',
  });
});

test('resolves the export from the module loader', async () => {
  const Primary = { name: 'Primary' };
  const stories = {
    'src/components/Button.story.ts': () => Promise.resolve({ Primary }),
  };

  expect(
    await resolveStory(stories, 'components/Button/Primary'),
  ).toStrictEqual({ outcome: 'story', story: Primary });
});

test('tells a missing export apart from a missing file', async () => {
  const stories = {
    'src/components/Button.story.ts': () =>
      Promise.resolve({ Primary: {}, Secondary: {} }),
  };

  // The file matched, only the export name is wrong
  expect(
    await resolveStory(stories, 'components/Button/Missing'),
  ).toStrictEqual({
    outcome: 'no-export',
    file: 'src/components/Button.story.ts',
    exportName: 'Missing',
    exportNames: ['Primary', 'Secondary'],
  });

  expect(
    await resolveStory(stories, 'components/Missing/Primary'),
  ).toStrictEqual({ outcome: 'no-file' });
});
