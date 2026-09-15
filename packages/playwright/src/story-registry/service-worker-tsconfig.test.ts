import { expect, test } from 'vitest';
import {
  STORY_TYPES_SW_EXCLUDE,
  withStoryTypesExcluded,
} from './service-worker-tsconfig';

interface TestTsConfig {
  exclude?: string[];
  include?: string[];
}

/** The tsconfig app-vite hands the hook, with the include list it generates. */
function createTsConfig(exclude?: string[]): TestTsConfig {
  const tsConfig: TestTsConfig = { include: ['./src-pwa/**/*', './*.d.ts'] };

  if (exclude !== undefined) {
    tsConfig.exclude = exclude;
  }

  return tsConfig;
}

test('excludes the registry when the app has no hook of its own', () => {
  const tsConfig = createTsConfig([]);

  const result = withStoryTypesExcluded<TestTsConfig>(undefined)(tsConfig);

  expect(tsConfig.exclude).toStrictEqual([STORY_TYPES_SW_EXCLUDE]);
  expect(result).toBe(undefined);
});

test('creates the exclude list when the tsconfig has none', () => {
  const tsConfig = createTsConfig();

  withStoryTypesExcluded<TestTsConfig>(undefined)(tsConfig);

  expect(tsConfig.exclude).toStrictEqual([STORY_TYPES_SW_EXCLUDE]);
});

test('leaves one copy when the registry is already excluded', () => {
  const tsConfig = createTsConfig(['./other.d.ts', STORY_TYPES_SW_EXCLUDE]);

  withStoryTypesExcluded<TestTsConfig>(undefined)(tsConfig);

  expect(tsConfig.exclude).toStrictEqual([
    './other.d.ts',
    STORY_TYPES_SW_EXCLUDE,
  ]);
});

test('runs a mutating hook after the registry is excluded', () => {
  const tsConfig = createTsConfig(['./other.d.ts']);
  let seenExclude: string[] | undefined;

  const result = withStoryTypesExcluded<TestTsConfig>((userTsConfig) => {
    seenExclude = [...(userTsConfig.exclude ?? [])];
    userTsConfig.include = ['./src-pwa/**/*'];
  })(tsConfig);

  expect(seenExclude).toStrictEqual(['./other.d.ts', STORY_TYPES_SW_EXCLUDE]);
  expect(tsConfig.include).toStrictEqual(['./src-pwa/**/*']);
  expect(tsConfig.exclude).toStrictEqual([
    './other.d.ts',
    STORY_TYPES_SW_EXCLUDE,
  ]);
  expect(result).toBe(undefined);
});

test('returns the overrides a hook answers with', () => {
  const tsConfig = createTsConfig([]);
  const overrides: TestTsConfig = { include: ['./src-pwa/**/*'] };

  const result = withStoryTypesExcluded<TestTsConfig>(() => overrides)(
    tsConfig,
  );

  expect(result).toBe(overrides);
  expect(tsConfig.exclude).toStrictEqual([STORY_TYPES_SW_EXCLUDE]);
});

test('lets a hook remove the entry the AE added', () => {
  const tsConfig = createTsConfig([]);

  withStoryTypesExcluded<TestTsConfig>((userTsConfig) => {
    userTsConfig.exclude = [];
  })(tsConfig);

  expect(tsConfig.exclude).toStrictEqual([]);
});
