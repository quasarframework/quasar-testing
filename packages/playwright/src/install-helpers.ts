import {
  appendFileSync,
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
} from 'node:fs';
import path from 'node:path';

export type PackageManager = 'pnpm' | 'yarn' | 'bun' | 'npm';

const PACKAGE_RUNNERS: Record<PackageManager, [string, ...string[]]> = {
  pnpm: ['pnpm', 'exec'],
  npm: ['npx'],
  yarn: ['yarn'],
  bun: ['bunx'],
};

// The scaffolded playwright.config runs Chromium only, so we only install that
const PLAYWRIGHT_BROWSER = 'chromium';
const PLAYWRIGHT_INSTALL_ARGS = ['playwright', 'install'];

/**
 * The browser install command, starting with the runner of the app's package
 * manager. It installs no system libraries. --with-deps needs root and covers
 * Debian and Ubuntu only. Playwright names the missing libraries on its own.
 */
export function browserInstallCommand(packageManager: PackageManager) {
  const [command, ...runnerArgs] = PACKAGE_RUNNERS[packageManager];

  return {
    command,
    args: [...runnerArgs, ...PLAYWRIGHT_INSTALL_ARGS, PLAYWRIGHT_BROWSER],
  };
}

const PACKAGE_JSON = 'package.json';
const NODE_VERSION_FILES = ['.node-version', '.nvmrc'] as const;

// Yarn 2 and newer keep their settings in this file
const YARN_BERRY_CONFIG = '.yarnrc.yml';

// Where an install runs is where one of these sits
const LOCKFILES = [
  'pnpm-lock.yaml',
  'yarn.lock',
  'bun.lock',
  'bun.lockb',
  'package-lock.json',
];

// A worktree has a .git file instead of a directory
const GIT_ENTRY = '.git';

export type NodeVersionSource =
  /** The path of the file from the git root, which is where a workflow runs. */
  { kind: 'file'; file: string } | { kind: 'lts' };

interface AppPackageJson {
  engines?: { node?: unknown };
  packageManager?: unknown;
}

/** The package.json of the app, or undefined when it is missing or unreadable. */
function readPackageJson(appDir: string): AppPackageJson | undefined {
  try {
    return JSON.parse(
      readFileSync(path.join(appDir, PACKAGE_JSON), 'utf-8'),
    ) as AppPackageJson;
  } catch {
    return undefined;
  }
}

/** appDir first, then every parent up to the filesystem root. */
function* directoriesUpwards(appDir: string) {
  let current = path.resolve(appDir);

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  while (true) {
    yield current;

    const parent = path.dirname(current);
    if (parent === current) {
      return;
    }

    current = parent;
  }
}

/** The same path with forward slashes. The workflow file needs them on Windows too. */
function toPosixPath(filePath: string) {
  return filePath.replaceAll('\\', '/');
}

function isGitRoot(directory: string) {
  return existsSync(path.join(directory, GIT_ENTRY));
}

/**
 * The app directory, then every parent up to and including the git root. Every
 * detection walks exactly this list. No detection reads a file outside the
 * checkout. Without a git root, only the app directory is read.
 */
function directoriesToGitRoot(appDir: string): string[] {
  const resolvedAppDir = path.resolve(appDir);
  const directories: string[] = [];

  for (const directory of directoriesUpwards(resolvedAppDir)) {
    directories.push(directory);

    if (isGitRoot(directory)) {
      return directories;
    }
  }

  return [resolvedAppDir];
}

/** Whether a .yarnrc.yml sits at or above the app. Yarn 2 and newer need --immutable. */
export function detectYarnBerry(appDir: string): boolean {
  return directoriesToGitRoot(appDir).some((directory) =>
    existsSync(path.join(directory, YARN_BERRY_CONFIG)),
  );
}

export interface LockfileLocation {
  /** The directory holding the lockfile, relative to the git root, empty at the root. */
  directory: string;
  /** The lockfile name, undefined when the repository has none. */
  file: string | undefined;
}

/**
 * Where the install of the workflow has to run. A repository whose app sits in
 * a subdirectory with its own lockfile installs there, not at the git root.
 * Without a lockfile anywhere the app's own directory is the answer, since that
 * is where an install would run.
 */
export function detectLockfileLocation(appDir: string): LockfileLocation {
  const directories = directoriesToGitRoot(appDir);
  const gitRoot = directories.at(-1) ?? path.resolve(appDir);

  for (const directory of directories) {
    const file = LOCKFILES.find((name) =>
      existsSync(path.join(directory, name)),
    );

    if (file !== undefined) {
      return {
        directory: toPosixPath(path.relative(gitRoot, directory)),
        file,
      };
    }
  }

  return {
    directory: toPosixPath(path.relative(gitRoot, path.resolve(appDir))),
    file: undefined,
  };
}

/**
 * The path of the app from the git root, with posix separators. Empty when the
 * app is the git root and when no ancestor holds a .git entry. GitHub runs a
 * workflow from the repository root. A step then needs this path to reach the app.
 */
export function detectWorkingDirectory(appDir: string): string {
  const resolvedAppDir = path.resolve(appDir);

  for (const directory of directoriesUpwards(resolvedAppDir)) {
    if (isGitRoot(directory)) {
      return toPosixPath(path.relative(directory, resolvedAppDir));
    }
  }

  return '';
}

/** Whether the package.json of the directory pins a node range. */
function hasNodeEngineRange(directory: string) {
  const engineRange = readPackageJson(directory)?.engines?.node;

  return typeof engineRange === 'string' && engineRange.trim() !== '';
}

/**
 * Where the workflow reads the Node version from, as a path from the git root.
 * The nearest directory wins. An app that pins its own version keeps it. A
 * workspace member that pins none takes the one of its repository root.
 */
export function detectNodeVersionSource(appDir: string): NodeVersionSource {
  const directories = directoriesToGitRoot(appDir);
  const gitRoot = directories.at(-1) ?? path.resolve(appDir);

  for (const directory of directories) {
    const name =
      NODE_VERSION_FILES.find((file) =>
        existsSync(path.join(directory, file)),
      ) ?? (hasNodeEngineRange(directory) ? PACKAGE_JSON : undefined);

    if (name !== undefined) {
      return {
        kind: 'file',
        file: toPosixPath(path.relative(gitRoot, path.join(directory, name))),
      };
    }
  }

  return { kind: 'lts' };
}

/**
 * Whether the app or an ancestor declares a packageManager field. The
 * actions/setup-node step runs at the repository root, so what counts is the
 * root's package.json and not the app's.
 */
export function hasPackageManagerField(appDir: string): boolean {
  for (const directory of directoriesToGitRoot(appDir)) {
    if (typeof readPackageJson(directory)?.packageManager === 'string') {
      return true;
    }
  }

  return false;
}

/** The versions the AE pins for the packages it adds to the app. */
export function pickDevDependencies(
  packageNames: readonly string[],
  availableVersions: Partial<Record<string, string>>,
) {
  const devDependencies: Record<string, string> = {};

  for (const packageName of packageNames) {
    const version = availableVersions[packageName];
    if (version === undefined) {
      throw new Error(
        `"${packageName}" is not listed in the devDependencies of the AE package.json`,
      );
    }

    devDependencies[packageName] = version;
  }

  return devDependencies;
}

/** Appends the entries the file does not list yet. Installing again adds nothing twice. */
export function appendGitignoreEntries(
  gitignorePath: string,
  entries: readonly string[],
) {
  const existingContent = existsSync(gitignorePath)
    ? readFileSync(gitignorePath, 'utf-8')
    : '';
  const existingLines = new Set(
    existingContent.split('\n').map((line) => line.trim()),
  );
  const missingEntries = entries.filter((entry) => !existingLines.has(entry));

  if (missingEntries.length === 0) {
    return;
  }

  // The blank line keeps the block apart from the existing content
  const separator = existingContent === '' ? '' : '\n';
  appendFileSync(gitignorePath, `${separator}${missingEntries.join('\n')}\n`);
}

/** Every file under the directory, as a path relative to it, sorted. */
export function listFiles(dir: string): string[] {
  return readdirSync(dir, { recursive: true, encoding: 'utf8' })
    .filter((entry) => statSync(path.join(dir, entry)).isFile())
    .sort();
}

const JAVASCRIPT_EXTENSIONS: Record<string, string> = {
  '.ts': '.js',
  '.tsx': '.jsx',
};

/**
 * The app path a demo template renders to. A JavaScript app gets .js and .jsx
 * files. A .vue file keeps its name in both.
 */
export function demoTargetPath(
  templatePath: string,
  shouldSupportTypeScript: boolean,
): string {
  if (shouldSupportTypeScript) {
    return templatePath;
  }

  const extension = path.extname(templatePath);
  const javascriptExtension = JAVASCRIPT_EXTENSIONS[extension];
  if (javascriptExtension === undefined) {
    return templatePath;
  }

  return templatePath.slice(0, -extension.length) + javascriptExtension;
}
