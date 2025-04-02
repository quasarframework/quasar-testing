import { spawnSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFile } from 'fs/promises';
import * as fs from 'fs';
import { enforcedDevServerPort } from './shared.js';

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

function appendToFileIfNotExists(filePath, searchText, appendText) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    if (content.includes(searchText)) {
      return;
    }
    fs.appendFileSync(filePath, appendText, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') {
      fs.appendFileSync(filePath, appendText, 'utf8');
      return;
    }
    console.error(`Error processing file ${filePath}:`, error);
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

    const gitignorePath = api.resolve.app('.gitignore');

    const playwrightCommentStart = '\n# Playwright';
    const playwrightGitignore = `\n${playwrightCommentStart}\n/test-results/\n/playwright-report/\n/blob-report/n/playwright/.cache/\n/playwright/.cache/\n`;
    appendToFileIfNotExists(
      gitignorePath,
      playwrightCommentStart,
      playwrightGitignore,
    );

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
