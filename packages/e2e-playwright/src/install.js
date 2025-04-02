import { spawn, spawnSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFile } from 'fs/promises';
import * as os from 'os';
import * as fs from 'fs';
import { existsSync } from 'fs';
import { enforcedDevServerPort } from './shared.js';

async function isUbuntuOrDebian() {
  const osType = os.type();
  if (osType !== 'Linux') {
    return false;
  }

  try {
    try {
      const osRelease = await fs.readFile('/etc/os-release', 'utf8');
      if (osRelease.includes('ID=ubuntu') || osRelease.includes('ID=debian')) {
        return true;
      }
    } catch {
      //
    }

    if (existsSync('/etc/debian_version')) {
      return true;
    }

    try {
      const osVersion = await fs.readFile('/etc/os-version', 'utf8');
      if (osVersion.toLowerCase().includes('debian')) {
        return true;
      }
    } catch {
      //
    }

    return false;
  } catch (error) {
    console.error('Could not determine Linux Distro', error.message);
    return false;
  }
}

// TODO: This install all browsers, consider giving the user the option of selecting specific browsers
async function installPlaywrightBrowsers() {
  try {
    spawnSync('npx', ['playwright', 'install'], {
      stdio: 'inherit',
      shell: true,
      env: process.env,
    });
  } catch (error) {
    console.error(
      'Installation failed. Run npx playwright install at any time to install',
      error,
    );
    process.exit(1);
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runPnpmCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    let pnpmExecutable;
    if (process.platform === 'win32') {
      pnpmExecutable = 'pnpm.cmd';
    } else {
      pnpmExecutable = 'pnpm';
    }

    const pnpmProcess = spawn(pnpmExecutable, [command, ...args], {
      stdio: 'inherit',
      ...options,
      shell: process.platform === 'win32',
    });

    pnpmProcess.on('error', (error) => {
      if (error.code === 'ENOENT') {
        console.error(
          'Error: pnpm is not installed or not in your PATH. Please install pnpm globally.',
        );
      }
      reject(error);
    });

    pnpmProcess.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`pnpm ${command} exited with code ${code}`));
      }
    });
  });
}

/**
 * Performs a deep merge of objects and returns new object. Does not modify
 * objects (immutable) and merges arrays via concatenation.
 * based on https://stackoverflow.com/a/49798508
 *
 * @param {...object} sources - Objects to merge
 * @returns {object} New object with merged key/values
 */

function __mergeDeep(...sources) {
  let result = {};
  for (const source of sources) {
    if (source instanceof Array) {
      if (!(result instanceof Array)) {
        result = [];
      }
      result = [...result, ...source];
    } else if (source instanceof Object) {
      for (let [key, value] of Object.entries(source)) {
        if (value instanceof Object && key in result) {
          value = __mergeDeep(result[key], value);
        }
        result = { ...result, [key]: value };
      }
    }
  }
  return result;
}

// We use devDependencies instead of peerDependencies because devDependencies are usually the latest version
// and peerDependencies could contain a string supporting multiple major versions (e.g. "playwright": "^1.1.12 || ^2.0.0")
const { devDependencies: aeDevDependencies } = JSON.parse(
  await readFile(join(__dirname, '..', 'package.json'), 'utf-8'),
);

function getCompatibleDevDependencies(packageNames) {
  const devDependencies = {};

  for (const packageName of packageNames) {
    devDependencies[packageName] = aeDevDependencies[packageName];
  }

  return devDependencies;
}

let extendPackageJson = {
  devDependencies: getCompatibleDevDependencies([
    'eslint-plugin-playwright',
    '@playwright/test',
    '@playwright/experimental-ct-vue',
  ]),
};

async function setUpPlaywright() {
  try {
    await runPnpmCommand('create', ['playwright']);
  } catch (error) {
    console.error('Some errors were found', error);

    if (os.type() !== 'Linux') {
      throw new Error();
    }

    if (!(await isUbuntuOrDebian())) {
      console.error('Your Linux distro is not supported.');
      return;
    }

    throw new Error();
  }
}

function answerIsYes(response) {
  return (
    response === 'y' ||
    response === 'Y' ||
    response === 'yes' ||
    response === 'Yes'
  );
}

export default async function (api) {
  setUpPlaywright();

  try {
    const devServerPort = api.prompts.port ?? enforcedDevServerPort;
    const supportsTypescript = await api.hasTypescript();

    if (answerIsYes(api.prompts.githubWorkflow)) {
      api.render('./templates/github-workflow');
    }

    const codeCoverageIsEnabled = answerIsYes(api.prompts.enableCodeCoverage);

    const configTemplate = supportsTypescript
      ? './templates/typescript'
      : './templates/javascript';
    api.render(configTemplate, {
      devServerPort,
      codeCoverageIsEnabled,
    });

    api.render('./templates/base', {
      shouldSupportTypeScript: supportsTypescript,
    });

    const testEnvCommand = `cross-env NODE_ENV=test`;

    const scripts = {
      scripts: {
        test: 'echo "See package.json => scripts for available tests." && exit 0',
        'test:e2e': `${testEnvCommand} playwright test --ui`,
        'test:e2e:ci': `${testEnvCommand} playwright test`,
      },
    };

    // Playwirght only offers native support for component testing with Vite
    if (api.hasPackage('@quasar/app-vite')) {
      scripts.scripts['test:component'] =
        `${testEnvCommand} playwright test -c playwright-ct.config.ts --ui`;
      scripts.scripts['test:component:ci'] =
        `${testEnvCommand} playwright test -c playwright-ct.config.ts`;
    }
    extendPackageJson = __mergeDeep(extendPackageJson, scripts);
    api.extendPackageJson(extendPackageJson);

    if (answerIsYes(api.prompts.installBrowsers)) {
      installPlaywrightBrowsers();
    }

    if (await api.hasLint()) {
      api.onExitLog(
        'Check out https://github.com/quasarframework/quasar-testing/tree/dev/packages/e2e-cypress to see how to add proper Cypress linting configuration to your project.',
      );
    }
  } catch (error) {
    console.error('An error occurred while installing the extension:', error);

    process.exit(1);
  }
}
