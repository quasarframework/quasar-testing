import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, test } from 'vitest';
import {
  appendGitignoreEntries,
  browserInstallCommand,
  demoTargetPath,
  detectLockfileLocation,
  detectNodeVersionSource,
  detectWorkingDirectory,
  detectYarnBerry,
  hasPackageManagerField,
  listFiles,
  pickDevDependencies,
} from './install-helpers';

const VERSIONS = { nyc: '^18.0.0', '@playwright/test': '^1.63.0' };

test('pickDevDependencies returns the pinned versions', () => {
  expect(
    pickDevDependencies(['nyc', '@playwright/test'], VERSIONS),
  ).toStrictEqual({
    nyc: '^18.0.0',
    '@playwright/test': '^1.63.0',
  });
});

test('pickDevDependencies names an unknown package', () => {
  expect(() =>
    pickDevDependencies(['eslint-plugin-playwright'], VERSIONS),
  ).toThrow(/"eslint-plugin-playwright" is not listed/);
});

function withGitignore(run: (gitignorePath: string) => void) {
  const directory = mkdtempSync(join(tmpdir(), 'gitignore-'));
  try {
    run(join(directory, '.gitignore'));
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

test('appendGitignoreEntries creates a missing file without a leading blank line', () => {
  withGitignore((gitignorePath) => {
    appendGitignoreEntries(gitignorePath, ['test-results/', 'coverage/']);
    expect(readFileSync(gitignorePath, 'utf-8')).toBe(
      'test-results/\ncoverage/\n',
    );
  });
});

test('appendGitignoreEntries appends only the missing entries', () => {
  withGitignore((gitignorePath) => {
    writeFileSync(gitignorePath, 'node_modules\n coverage/ \n');
    appendGitignoreEntries(gitignorePath, ['test-results/', 'coverage/']);
    expect(readFileSync(gitignorePath, 'utf-8')).toBe(
      'node_modules\n coverage/ \n\ntest-results/\n',
    );
  });
});

test('appendGitignoreEntries does nothing on a second call', () => {
  withGitignore((gitignorePath) => {
    appendGitignoreEntries(gitignorePath, ['test-results/']);
    const once = readFileSync(gitignorePath, 'utf-8');
    appendGitignoreEntries(gitignorePath, ['test-results/']);
    expect(readFileSync(gitignorePath, 'utf-8')).toBe(once);
  });
});

test('appendGitignoreEntries ignores an entry mentioned in a comment', () => {
  withGitignore((gitignorePath) => {
    writeFileSync(gitignorePath, '# coverage/ is reported elsewhere\n');
    appendGitignoreEntries(gitignorePath, ['coverage/']);
    expect(readFileSync(gitignorePath, 'utf-8')).toBe(
      '# coverage/ is reported elsewhere\n\ncoverage/\n',
    );
  });
});

function createApp(files: Record<string, string>) {
  const appDir = mkdtempSync(join(tmpdir(), 'install-helpers-'));

  for (const [name, content] of Object.entries(files)) {
    writeFileSync(join(appDir, name), content);
  }

  return appDir;
}

function withApp(
  files: Record<string, string>,
  check: (appDir: string) => void,
) {
  const appDir = createApp(files);

  try {
    check(appDir);
  } finally {
    rmSync(appDir, { recursive: true, force: true });
  }
}

test('detectNodeVersionSource prefers .node-version over everything', () => {
  withApp(
    {
      '.node-version': '22\n',
      '.nvmrc': '20\n',
      'package.json': '{"engines":{"node":"^22"}}',
    },
    (appDir) => {
      expect(detectNodeVersionSource(appDir)).toStrictEqual({
        kind: 'file',
        file: '.node-version',
      });
    },
  );
});

test('detectNodeVersionSource prefers .nvmrc over package.json', () => {
  withApp(
    { '.nvmrc': '20\n', 'package.json': '{"engines":{"node":"^22"}}' },
    (appDir) => {
      expect(detectNodeVersionSource(appDir)).toStrictEqual({
        kind: 'file',
        file: '.nvmrc',
      });
    },
  );
});

test('detectNodeVersionSource reads engines.node of package.json', () => {
  withApp({ 'package.json': '{"engines":{"node":"^22"}}' }, (appDir) => {
    expect(detectNodeVersionSource(appDir)).toStrictEqual({
      kind: 'file',
      file: 'package.json',
    });
  });
});

test('detectNodeVersionSource falls back to the current lts', () => {
  withApp({ 'package.json': '{}' }, (appDir) => {
    expect(detectNodeVersionSource(appDir)).toStrictEqual({ kind: 'lts' });
  });
  withApp({ 'package.json': '{"engines":{"npm":">=10"}}' }, (appDir) => {
    expect(detectNodeVersionSource(appDir)).toStrictEqual({ kind: 'lts' });
  });
  withApp({ 'package.json': '{"engines":{"node":"  "}}' }, (appDir) => {
    expect(detectNodeVersionSource(appDir)).toStrictEqual({ kind: 'lts' });
  });
  withApp({}, (appDir) => {
    expect(detectNodeVersionSource(appDir)).toStrictEqual({ kind: 'lts' });
  });
});

test('detectNodeVersionSource falls back to the current lts on unreadable json', () => {
  withApp({ 'package.json': '{ not json' }, (appDir) => {
    expect(detectNodeVersionSource(appDir)).toStrictEqual({ kind: 'lts' });
  });
});

test('hasPackageManagerField finds the field two levels up', () => {
  const { rootDir, memberDir } = createWorkspace(
    { 'package.json': '{"packageManager":"pnpm@11.24.0"}' },
    { 'package.json': '{}' },
  );

  try {
    expect(hasPackageManagerField(memberDir)).toBe(true);
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test('hasPackageManagerField is false when no ancestor declares one', () => {
  const { rootDir, memberDir } = createWorkspace({}, { 'package.json': '{}' });

  try {
    expect(hasPackageManagerField(memberDir)).toBe(false);
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test('hasPackageManagerField reads the field of package.json', () => {
  withApp({ 'package.json': '{"packageManager":"pnpm@11.0.0"}' }, (appDir) => {
    expect(hasPackageManagerField(appDir)).toBe(true);
  });
  withApp({ 'package.json': '{}' }, (appDir) => {
    expect(hasPackageManagerField(appDir)).toBe(false);
  });
  withApp({}, (appDir) => {
    expect(hasPackageManagerField(appDir)).toBe(false);
  });
});

/** A workspace root holding one member, both with the files the case needs. */
function createWorkspace(
  rootFiles: Record<string, string>,
  memberFiles: Record<string, string>,
  { hasGitRoot = true } = {},
) {
  const rootDir = mkdtempSync(join(tmpdir(), 'install-helpers-ws-'));
  const memberDir = join(rootDir, 'packages', 'app');
  mkdirSync(memberDir, { recursive: true });

  // Every walk stops at the git root, so the fixture needs one or the walk
  // would climb into the filesystem of the machine running the test.
  if (hasGitRoot) {
    mkdirSync(join(rootDir, '.git'));
  }

  for (const [name, content] of Object.entries(rootFiles)) {
    writeFileSync(join(rootDir, name), content);
  }

  for (const [name, content] of Object.entries(memberFiles)) {
    writeFileSync(join(memberDir, name), content);
  }

  return { rootDir, memberDir };
}

test('detectYarnBerry finds .yarnrc.yml in the app or an ancestor', () => {
  withApp({ '.yarnrc.yml': '' }, (appDir) => {
    expect(detectYarnBerry(appDir)).toBe(true);
  });

  const { rootDir, memberDir } = createWorkspace(
    { '.yarnrc.yml': '' },
    { 'package.json': '{}' },
  );

  try {
    expect(detectYarnBerry(memberDir)).toBe(true);
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test('detectYarnBerry is false without the file', () => {
  withApp({ 'yarn.lock': '' }, (appDir) => {
    expect(detectYarnBerry(appDir)).toBe(false);
  });
});

test('detectYarnBerry stops at the git root', () => {
  const { rootDir, memberDir } = createWorkspace({}, { 'package.json': '{}' });

  try {
    expect(detectYarnBerry(memberDir)).toBe(false);
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test('detectWorkingDirectory gives the path from the git root', () => {
  const { rootDir, memberDir } = createWorkspace({}, { 'package.json': '{}' });

  try {
    expect(detectWorkingDirectory(memberDir)).toBe('packages/app');
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test('detectWorkingDirectory is empty when the app is the git root', () => {
  const { rootDir } = createWorkspace({}, { 'package.json': '{}' });

  try {
    expect(detectWorkingDirectory(rootDir)).toBe('');
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test('detectWorkingDirectory accepts a .git file, which a worktree uses', () => {
  const { rootDir, memberDir } = createWorkspace(
    { '.git': 'gitdir: /elsewhere' },
    { 'package.json': '{}' },
    { hasGitRoot: false },
  );

  try {
    expect(detectWorkingDirectory(memberDir)).toBe('packages/app');
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test('detectWorkingDirectory is empty without a git root', () => {
  const { rootDir, memberDir } = createWorkspace(
    {},
    { 'package.json': '{}' },
    { hasGitRoot: false },
  );

  try {
    expect(detectWorkingDirectory(memberDir)).toBe('');
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test('browserInstallCommand runs playwright through the package manager', () => {
  expect(browserInstallCommand('pnpm')).toStrictEqual({
    command: 'pnpm',
    args: ['exec', 'playwright', 'install', 'chromium'],
  });
  expect(browserInstallCommand('npm')).toStrictEqual({
    command: 'npx',
    args: ['playwright', 'install', 'chromium'],
  });
  expect(browserInstallCommand('yarn')).toStrictEqual({
    command: 'yarn',
    args: ['playwright', 'install', 'chromium'],
  });
  expect(browserInstallCommand('bun')).toStrictEqual({
    command: 'bunx',
    args: ['playwright', 'install', 'chromium'],
  });
});

test('detectNodeVersionSource reads the version file of the git root', () => {
  const { rootDir, memberDir } = createWorkspace(
    { '.node-version': '22\n' },
    { 'package.json': '{}' },
  );

  try {
    expect(detectNodeVersionSource(memberDir)).toStrictEqual({
      kind: 'file',
      file: '.node-version',
    });
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test('detectNodeVersionSource prefers the app over its git root', () => {
  const { rootDir, memberDir } = createWorkspace(
    { '.node-version': '22\n' },
    { 'package.json': '{"engines":{"node":"^24"}}' },
  );

  try {
    expect(detectNodeVersionSource(memberDir)).toStrictEqual({
      kind: 'file',
      file: 'packages/app/package.json',
    });
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test('every detection reads the git root of a workspace member', () => {
  const { rootDir, memberDir } = createWorkspace(
    {
      '.yarnrc.yml': '',
      '.node-version': '22\n',
      'package.json': '{"packageManager":"yarn@4.1.0"}',
    },
    { 'package.json': '{}' },
  );

  try {
    expect(detectYarnBerry(memberDir)).toBe(true);
    expect(hasPackageManagerField(memberDir)).toBe(true);
    expect(detectNodeVersionSource(memberDir)).toStrictEqual({
      kind: 'file',
      file: '.node-version',
    });
    expect(detectWorkingDirectory(memberDir)).toBe('packages/app');
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test('detectLockfileLocation finds the lockfile of the git root', () => {
  const { rootDir, memberDir } = createWorkspace(
    { 'pnpm-lock.yaml': '' },
    { 'package.json': '{}' },
  );

  try {
    expect(detectLockfileLocation(memberDir)).toStrictEqual({
      directory: '',
      file: 'pnpm-lock.yaml',
    });
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test('detectLockfileLocation prefers a lockfile beside the app', () => {
  const { rootDir, memberDir } = createWorkspace(
    { 'pnpm-lock.yaml': '' },
    { 'package.json': '{}', 'package-lock.json': '' },
  );

  try {
    expect(detectLockfileLocation(memberDir)).toStrictEqual({
      directory: 'packages/app',
      file: 'package-lock.json',
    });
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test('detectLockfileLocation falls back to the app directory', () => {
  const { rootDir, memberDir } = createWorkspace({}, { 'package.json': '{}' });

  try {
    expect(detectLockfileLocation(memberDir)).toStrictEqual({
      directory: 'packages/app',
      file: undefined,
    });
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test('demoTargetPath keeps every name in a TypeScript app', () => {
  expect(demoTargetPath('test/playwright/demo/Button.spec.ts', true)).toBe(
    'test/playwright/demo/Button.spec.ts',
  );
  expect(demoTargetPath('test/playwright/demo/Button.story.tsx', true)).toBe(
    'test/playwright/demo/Button.story.tsx',
  );
});

test('demoTargetPath maps the extension for a JavaScript app', () => {
  expect(demoTargetPath('test/playwright/demo/Button.spec.ts', false)).toBe(
    'test/playwright/demo/Button.spec.js',
  );
  expect(demoTargetPath('test/playwright/demo/Button.story.tsx', false)).toBe(
    'test/playwright/demo/Button.story.jsx',
  );
  expect(demoTargetPath('test/playwright/demo/Dialog.story.vue', false)).toBe(
    'test/playwright/demo/Dialog.story.vue',
  );
});

test('listFiles walks the tree and skips the directories', () => {
  const rootDir = mkdtempSync(join(tmpdir(), 'list-files-'));

  try {
    mkdirSync(join(rootDir, 'nested/deeper'), { recursive: true });
    writeFileSync(join(rootDir, 'b.txt'), '');
    writeFileSync(join(rootDir, 'nested/a.txt'), '');
    writeFileSync(join(rootDir, 'nested/deeper/c.txt'), '');

    expect(listFiles(rootDir)).toEqual([
      'b.txt',
      join('nested', 'a.txt'),
      join('nested', 'deeper', 'c.txt'),
    ]);
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});
