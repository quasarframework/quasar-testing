/*
  Renders .github/workflows/playwright.yml. YAML is whitespace-sensitive, so
  the file is built line by line here and a test parses every combination.
*/

import type {
  LockfileLocation,
  NodeVersionSource,
  PackageManager,
} from './install-helpers';

const HEADER_COMMENT = [
  '# playwright.config runs Chromium, so this workflow only installs that.',
  '# Add the other browsers to this step when the config gains projects for them.',
  '# playwright.config ships a commented-out command that builds the app and serves the bundle when CI is set.',
  '# Uncomment it to run the tests against the production bundle here. GitHub Actions sets CI.',
];

/** The actions the workflow uses. */
export const WORKFLOW_ACTIONS = {
  checkout: 'actions/checkout@v7',
  setupNode: 'actions/setup-node@v7',
  uploadArtifact: 'actions/upload-artifact@v7',
  setupPnpm: 'pnpm/action-setup@v6',
  setupBun: 'oven-sh/setup-bun@v2',
} as const;

const STEP_INDENT = '      ';
const PROPERTY_INDENT = '        ';
const WITH_INDENT = '          ';
const PATH_INDENT = '            ';

const ALWAYS_RUN = 'if: ${{ !cancelled() }}';

const REPORT_DIRECTORY = 'playwright-report/';
const COVERAGE_DIRECTORY = 'coverage/';
const ARTIFACT_RETENTION_DAYS = 30;
const JOB_TIMEOUT_MINUTES = 30;

/** What each package manager uses to run a binary of the app's node_modules. */
export const EXEC_PREFIXES: Record<PackageManager, string> = {
  pnpm: 'pnpm exec',
  yarn: 'yarn',
  bun: 'bunx',
  npm: 'npx',
};

const RUN_PREFIXES: Record<PackageManager, string> = {
  pnpm: 'pnpm',
  yarn: 'yarn',
  bun: 'bun run',
  npm: 'npm run',
};

const INSTALL_COMMANDS: Record<PackageManager, string> = {
  pnpm: 'pnpm install --frozen-lockfile',
  yarn: 'yarn install --frozen-lockfile',
  bun: 'bun install --frozen-lockfile',
  npm: 'npm ci',
};

// yarn 2 and newer reject --frozen-lockfile
const YARN_BERRY_INSTALL = 'yarn install --immutable';

export interface WorkflowOptions {
  /** Where the install runs and which lockfile the node cache reads. */
  lockfileLocation: LockfileLocation;
  packageManager: PackageManager;
  nodeVersionSource: NodeVersionSource;
  hasPackageManagerField: boolean;
  isYarnBerry: boolean;
  shouldAddCodeCoverage: boolean;
  /** The app directory relative to the git root with posix separators, empty when the app is the git root. */
  workingDirectory: string;
}

function installCommand({ packageManager, isYarnBerry }: WorkflowOptions) {
  if (packageManager === 'yarn' && isYarnBerry) {
    return YARN_BERRY_INSTALL;
  }

  return INSTALL_COMMANDS[packageManager];
}

/** A path inside the app, prefixed for a workspace member. */
function appPath(options: WorkflowOptions, relativePath: string) {
  if (options.workingDirectory === '') {
    return relativePath;
  }

  return `${options.workingDirectory}/${relativePath}`;
}

/** The working-directory line for a step that runs inside the app. Empty when the app is the git root. */
function workingDirectoryLines(options: WorkflowOptions) {
  if (options.workingDirectory === '') {
    return [];
  }

  return [`${PROPERTY_INDENT}working-directory: ${options.workingDirectory}`];
}

function nodeVersionLines(options: WorkflowOptions) {
  const { nodeVersionSource } = options;

  if (nodeVersionSource.kind === 'lts') {
    return [`${WITH_INDENT}node-version: lts/*`];
  }

  // The detection already reports the path from the git root, where a workflow runs
  return [`${WITH_INDENT}node-version-file: ${nodeVersionSource.file}`];
}

function packageManagerSetupLines(options: WorkflowOptions) {
  const { packageManager, hasPackageManagerField } = options;

  if (packageManager === 'bun') {
    return [`${STEP_INDENT}- uses: ${WORKFLOW_ACTIONS.setupBun}`];
  }

  if (packageManager !== 'pnpm') {
    return [];
  }

  if (hasPackageManagerField) {
    return [`${STEP_INDENT}- uses: ${WORKFLOW_ACTIONS.setupPnpm}`];
  }

  return [
    `${STEP_INDENT}- uses: ${WORKFLOW_ACTIONS.setupPnpm}`,
    `${PROPERTY_INDENT}with:`,
    `${WITH_INDENT}# Pin this to the pnpm version you use, or add a packageManager field to package.json.`,
    `${WITH_INDENT}version: latest`,
  ];
}

function nodeSetupLines(options: WorkflowOptions) {
  // The bun setup action installs its own runtime, so a bun app needs no Node step
  if (options.packageManager === 'bun') {
    return [];
  }

  const { directory, file } = options.lockfileLocation;

  return [
    `${STEP_INDENT}- uses: ${WORKFLOW_ACTIONS.setupNode}`,
    `${PROPERTY_INDENT}with:`,
    ...nodeVersionLines(options),
    `${WITH_INDENT}cache: ${options.packageManager}`,
    // The cache looks for the lockfile at the repository root by default
    ...(directory !== '' && file !== undefined
      ? [`${WITH_INDENT}cache-dependency-path: ${directory}/${file}`]
      : []),
  ];
}

/** The working-directory line of the install step, when it does not run at the git root. */
function installDirectoryLines(options: WorkflowOptions) {
  const { directory } = options.lockfileLocation;

  if (directory === '') {
    return [];
  }

  return [`${PROPERTY_INDENT}working-directory: ${directory}`];
}

function coverageLines(options: WorkflowOptions) {
  if (!options.shouldAddCodeCoverage) {
    return [];
  }

  return [
    `${STEP_INDENT}- run: ${RUN_PREFIXES[options.packageManager]} test:coverage:report`,
    `${PROPERTY_INDENT}${ALWAYS_RUN}`,
    ...workingDirectoryLines(options),
  ];
}

function artifactPathLines(options: WorkflowOptions) {
  const directories = [REPORT_DIRECTORY];

  if (options.shouldAddCodeCoverage) {
    directories.push(COVERAGE_DIRECTORY);
  }

  return directories.map(
    (directory) => `${PATH_INDENT}${appPath(options, directory)}`,
  );
}

/** One entry per step, so the blank lines can go between them. */
function stepBlocks(options: WorkflowOptions): string[][] {
  const execPrefix = EXEC_PREFIXES[options.packageManager];

  const blocks = [
    [`${STEP_INDENT}- uses: ${WORKFLOW_ACTIONS.checkout}`],
    packageManagerSetupLines(options),
    nodeSetupLines(options),
    // The install runs where the lockfile is, which is the git root for a
    // workspace and the app's own directory for a repository that holds one app.
    [
      `${STEP_INDENT}- run: ${installCommand(options)}`,
      ...installDirectoryLines(options),
    ],
    [
      `${STEP_INDENT}- run: ${execPrefix} playwright install --with-deps chromium`,
      ...workingDirectoryLines(options),
    ],
    [
      `${STEP_INDENT}- run: ${execPrefix} playwright test`,
      ...workingDirectoryLines(options),
    ],
    coverageLines(options),
    [
      `${STEP_INDENT}- uses: ${WORKFLOW_ACTIONS.uploadArtifact}`,
      `${PROPERTY_INDENT}${ALWAYS_RUN}`,
      `${PROPERTY_INDENT}with:`,
      `${WITH_INDENT}name: playwright-report`,
      `${WITH_INDENT}path: |`,
      ...artifactPathLines(options),
      `${WITH_INDENT}retention-days: ${ARTIFACT_RETENTION_DAYS}`,
    ],
  ];

  return blocks.filter((block) => block.length > 0);
}

/** Joins the steps with a blank line between them. The first one follows "steps:" directly. */
function joinStepBlocks(blocks: readonly string[][]): string[] {
  const lines: string[] = [];

  for (const block of blocks) {
    if (lines.length > 0) {
      lines.push('');
    }

    lines.push(...block);
  }

  return lines;
}

/** The content of .github/workflows/playwright.yml. */
export function renderWorkflow(options: WorkflowOptions): string {
  const lines = [
    ...HEADER_COMMENT,
    'name: Playwright tests',
    '',
    'on:',
    '  push:',
    '    branches: [main, master]',
    '  pull_request:',
    '',
    'jobs:',
    '  test:',
    '    runs-on: ubuntu-latest',
    `    timeout-minutes: ${JOB_TIMEOUT_MINUTES}`,
    '    steps:',
    ...joinStepBlocks(stepBlocks(options)),
  ];

  return `${lines.join('\n')}\n`;
}
