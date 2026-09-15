import { expect, test } from 'vitest';
import YAML from 'yaml';
import {
  EXEC_PREFIXES,
  renderWorkflow,
  WORKFLOW_ACTIONS,
  type WorkflowOptions,
} from './github-workflow';
import type { NodeVersionSource, PackageManager } from './install-helpers';

const PACKAGE_MANAGERS: readonly PackageManager[] = [
  'pnpm',
  'yarn',
  'bun',
  'npm',
];

const NODE_VERSION_SOURCES: readonly NodeVersionSource[] = [
  { kind: 'file', file: '.node-version' },
  { kind: 'file', file: '.nvmrc' },
  { kind: 'file', file: 'package.json' },
  { kind: 'lts' },
];

const WORKING_DIRECTORIES = ['', 'packages/app'];

const ROOT_LOCKFILE = { directory: '', file: 'pnpm-lock.yaml' };

const BASE_OPTIONS: WorkflowOptions = {
  lockfileLocation: ROOT_LOCKFILE,
  packageManager: 'pnpm',
  nodeVersionSource: { kind: 'file', file: '.node-version' },
  hasPackageManagerField: true,
  isYarnBerry: false,
  shouldAddCodeCoverage: false,
  workingDirectory: '',
};

interface WorkflowStep {
  uses?: string;
  run?: string;
  with?: Record<string, unknown>;
  'working-directory'?: string;
}

/** The steps of the one job, after a real YAML parse. */
function parseSteps(options: Partial<WorkflowOptions>): WorkflowStep[] {
  const document = YAML.parse(
    renderWorkflow({ ...BASE_OPTIONS, ...options }),
  ) as { jobs: { test: { steps: WorkflowStep[] } } };

  return document.jobs.test.steps;
}

function stepNames(steps: readonly WorkflowStep[]) {
  return steps.map((step) => step.uses ?? step.run ?? '');
}

/** The one step whose run command contains the fragment. */
function findRunStep(steps: readonly WorkflowStep[], fragment: string) {
  return steps.find((step) => step.run?.includes(fragment));
}

/** The "with" block of the step using the given action, empty when it has none. */
function stepWith(steps: readonly WorkflowStep[], uses: string) {
  return steps.find((step) => step.uses === uses)?.with ?? {};
}

test('every combination parses as yaml with a steps array', () => {
  for (const packageManager of PACKAGE_MANAGERS) {
    for (const nodeVersionSource of NODE_VERSION_SOURCES) {
      for (const isYarnBerry of packageManager === 'yarn'
        ? [false, true]
        : [false]) {
        for (const shouldAddCodeCoverage of [false, true]) {
          for (const workingDirectory of WORKING_DIRECTORIES) {
            for (const hasPackageManagerField of [false, true]) {
              const steps = parseSteps({
                packageManager,
                nodeVersionSource,
                hasPackageManagerField,
                isYarnBerry,
                shouldAddCodeCoverage,
                workingDirectory,
              });

              expect(stepNames(steps)).toContain(
                `${EXEC_PREFIXES[packageManager]} playwright test`,
              );
            }
          }
        }
      }
    }
  }
});

test('pnpm sets itself up before node', () => {
  const names = stepNames(parseSteps({ packageManager: 'pnpm' }));
  const pnpmIndex = names.indexOf(WORKFLOW_ACTIONS.setupPnpm);
  const nodeIndex = names.indexOf(WORKFLOW_ACTIONS.setupNode);

  expect(pnpmIndex).not.toBe(-1);
  expect(nodeIndex).not.toBe(-1);
  expect(pnpmIndex).toBeLessThan(nodeIndex);
});

test('pnpm pins a version only without a packageManager field', () => {
  const withField = parseSteps({
    packageManager: 'pnpm',
    hasPackageManagerField: true,
  });
  expect(stepWith(withField, WORKFLOW_ACTIONS.setupPnpm)).toStrictEqual({});

  const withoutField = parseSteps({
    packageManager: 'pnpm',
    hasPackageManagerField: false,
  });
  expect(stepWith(withoutField, WORKFLOW_ACTIONS.setupPnpm).version).toBe(
    'latest',
  );
});

test('bun sets itself up and skips node', () => {
  const names = stepNames(parseSteps({ packageManager: 'bun' }));

  expect(names).toContain(WORKFLOW_ACTIONS.setupBun);
  expect(names).not.toContain(WORKFLOW_ACTIONS.setupNode);
});

test('every other package manager sets up node', () => {
  for (const packageManager of ['pnpm', 'yarn', 'npm'] as const) {
    const names = stepNames(parseSteps({ packageManager }));
    expect(names).toContain(WORKFLOW_ACTIONS.setupNode);
  }

  for (const packageManager of ['yarn', 'npm'] as const) {
    expect(stepNames(parseSteps({ packageManager }))).not.toContain(
      WORKFLOW_ACTIONS.setupPnpm,
    );
  }
});

test('the install command matches the package manager', () => {
  const installCommands = {
    pnpm: 'pnpm install --frozen-lockfile',
    bun: 'bun install --frozen-lockfile',
    npm: 'npm ci',
  };

  for (const [packageManager, expected] of Object.entries(installCommands)) {
    const steps = parseSteps({
      packageManager: packageManager as PackageManager,
    });
    expect(stepNames(steps)).toContain(expected);
  }
});

test('yarn berry installs with --immutable', () => {
  expect(
    stepNames(parseSteps({ packageManager: 'yarn', isYarnBerry: true })),
  ).toContain('yarn install --immutable');
  expect(
    stepNames(parseSteps({ packageManager: 'yarn', isYarnBerry: false })),
  ).toContain('yarn install --frozen-lockfile');
});

test('the exec prefix matches the package manager', () => {
  const execCommands = {
    pnpm: 'pnpm exec playwright test',
    yarn: 'yarn playwright test',
    bun: 'bunx playwright test',
    npm: 'npx playwright test',
  };

  for (const [packageManager, expected] of Object.entries(execCommands)) {
    const steps = parseSteps({
      packageManager: packageManager as PackageManager,
    });
    expect(stepNames(steps)).toContain(expected);
  }
});

test('the node version comes from the detected source', () => {
  for (const file of ['.node-version', '.nvmrc', 'package.json'] as const) {
    const setupWith = stepWith(
      parseSteps({ nodeVersionSource: { kind: 'file', file } }),
      WORKFLOW_ACTIONS.setupNode,
    );

    expect(setupWith['node-version-file']).toBe(file);
    expect(setupWith['node-version']).toBe(undefined);
  }

  const ltsWith = stepWith(
    parseSteps({ nodeVersionSource: { kind: 'lts' } }),
    WORKFLOW_ACTIONS.setupNode,
  );

  expect(ltsWith['node-version']).toBe('lts/*');
  expect(ltsWith['node-version-file']).toBe(undefined);
});

test('the coverage step and the coverage artifact appear only with coverage', () => {
  const withCoverage = parseSteps({ shouldAddCodeCoverage: true });

  expect(findRunStep(withCoverage, 'test:coverage:report')).toBeDefined();
  expect(stepWith(withCoverage, WORKFLOW_ACTIONS.uploadArtifact).path).toBe(
    'playwright-report/\ncoverage/\n',
  );

  const withoutCoverage = parseSteps({ shouldAddCodeCoverage: false });

  expect(findRunStep(withoutCoverage, 'test:coverage:report')).toBe(undefined);
  expect(stepWith(withoutCoverage, WORKFLOW_ACTIONS.uploadArtifact).path).toBe(
    'playwright-report/\n',
  );
});

test('a workspace member runs the playwright steps in its own directory', () => {
  const steps = parseSteps({
    workingDirectory: 'packages/app',
    shouldAddCodeCoverage: true,
  });

  for (const fragment of [
    'playwright install',
    'playwright test',
    'test:coverage:report',
  ]) {
    expect(findRunStep(steps, fragment)?.['working-directory']).toBe(
      'packages/app',
    );
  }

  // The lockfile is at the git root, so the install runs there
  expect(
    findRunStep(steps, 'install --frozen-lockfile')?.['working-directory'],
  ).toBe(undefined);
});

test('a workspace member prefixes the artifacts and keeps the node version path', () => {
  const steps = parseSteps({
    workingDirectory: 'packages/app',
    // The detection reports this from the git root already
    nodeVersionSource: { kind: 'file', file: 'packages/app/package.json' },
    shouldAddCodeCoverage: true,
  });

  expect(stepWith(steps, WORKFLOW_ACTIONS.setupNode)['node-version-file']).toBe(
    'packages/app/package.json',
  );
  expect(stepWith(steps, WORKFLOW_ACTIONS.uploadArtifact).path).toBe(
    'packages/app/playwright-report/\npackages/app/coverage/\n',
  );
});

test('the root app carries no working-directory anywhere', () => {
  const steps = parseSteps({
    workingDirectory: '',
    shouldAddCodeCoverage: true,
  });

  for (const step of steps) {
    expect(step['working-directory']).toBe(undefined);
  }
});

test('sets every step apart with a blank line', () => {
  const lines = renderWorkflow({
    ...BASE_OPTIONS,
    hasPackageManagerField: true,
    shouldAddCodeCoverage: true,
  }).split('\n');

  const stepIndexes = lines
    .map((line, index) => ({ line, index }))
    .filter(({ line }) => line.startsWith('      - '))
    .map(({ index }) => index);

  expect(stepIndexes.length).toBe(8);

  // The first step follows "steps:" directly, the rest each open a block
  for (const [position, index] of stepIndexes.entries()) {
    const expected = position === 0 ? '    steps:' : '';

    expect(lines[index - 1]).toBe(expected);
  }
});

test('a lockfile at the git root installs there, with no cache path', () => {
  const steps = parseSteps({ lockfileLocation: ROOT_LOCKFILE });
  const install = findRunStep(steps, 'install --frozen-lockfile');

  expect(install?.['working-directory']).toBe(undefined);
  expect(
    stepWith(steps, WORKFLOW_ACTIONS.setupNode)['cache-dependency-path'],
  ).toBe(undefined);
});

test('a lockfile beside the app installs there and points the cache at it', () => {
  const steps = parseSteps({
    workingDirectory: 'app',
    lockfileLocation: { directory: 'app', file: 'package-lock.json' },
    packageManager: 'npm',
  });
  const install = findRunStep(steps, 'npm ci');

  // Without this the workflow runs npm ci at the git root and fails on ENOENT
  expect(install?.['working-directory']).toBe('app');
  expect(
    stepWith(steps, WORKFLOW_ACTIONS.setupNode)['cache-dependency-path'],
  ).toBe('app/package-lock.json');
});

test('no lockfile anywhere installs in the app directory', () => {
  const steps = parseSteps({
    workingDirectory: 'app',
    lockfileLocation: { directory: 'app', file: undefined },
    packageManager: 'npm',
  });

  expect(findRunStep(steps, 'npm ci')?.['working-directory']).toBe('app');
  // There is no lockfile to point the cache at
  expect(
    stepWith(steps, WORKFLOW_ACTIONS.setupNode)['cache-dependency-path'],
  ).toBe(undefined);
});
