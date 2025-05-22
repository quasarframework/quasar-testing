import { spawnSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFile } from 'fs/promises';
import * as fs from 'fs';
import { enforcedDevServerPort } from './shared.js';

// TODO: This installs all browsers, consider giving the user the option of selecting specific browsers
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

// eslint-plugin-playwright works well with both eslint v8 and eslint v9
let extendPackageJson = {
  devDependencies: getCompatibleDevDependencies([
    '@playwright/test',
    'eslint-plugin-playwright',
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

export default async function (api) {
  api.compatibleWith('quasar', '^2.0.0');
  if (api.hasVite) {
    // PromptsAPI and hasTypescript are only available from v1.6.0 onwards
    api.compatibleWith('@quasar/app-vite', '^v1.6.0 || ^2.0.0');
  } else if (api.hasWebpack) {
    // PromptsAPI and hasTypescript are only available from v3.11.0 onwards
    api.compatibleWith('@quasar/app-webpack', '^3.11.0 || ^4.0.0');
  }

  try {
    if (api.prompts.port && api.prompts.port !== enforcedDevServerPort) {
      const port = parseInt(api.prompts.port.trim(), 10);
      if (!Number.isInteger(port)) {
        throw new Error(`Invalid port number: ${api.prompts.port}`);
      }
    }

    const devServerPort = api.prompts.port ?? enforcedDevServerPort;
    const supportsTypescript = await api.hasTypescript();
    const shouldEnableCodeCoverage =
      api.prompts.enableCodeCoverage && api.hasVite;

    if (api.prompts.githubWorkflow) {
      api.render('./templates/github-workflow');
    }

    const configTemplate = supportsTypescript
      ? './templates/typescript'
      : './templates/javascript';
    api.render(`${configTemplate}/base`, {
      devServerPort,
      codeCoverageIsEnabled: shouldEnableCodeCoverage,
    });

    // Playwright only offers native support for component testing with Vite
    // https://playwright.dev/docs/test-components
    if (api.hasVite) {
      api.render(`${configTemplate}/component-test`, {
        codeCoverageIsEnabled: shouldEnableCodeCoverage,
      });

      api.render('./templates/component-test', {
        shouldSupportTypeScript: supportsTypescript,
      });
    }

    let testEnvCommand = 'cross-env NODE_ENV=test';
    if (shouldEnableCodeCoverage) {
      // We have set requireEnv in istanbul to true, so this is needed for instrumentation to work
      testEnvCommand += ' VITE_COVERAGE=true';
    }

    const packageManager = await api.getNodePackagerName();
    const scripts = {
      scripts: {
        test: `${packageManager} test:clear && ${packageManager} test:component:ci && ${packageManager} test:e2e:ci`,
        'test:clear': 'rimraf .nyc_output coverage',
        'test:e2e': `${testEnvCommand} playwright test --ui`,
        'test:e2e:ci': `${testEnvCommand} playwright test`,
        'test:report': `playwright show-report`,
      },
    };

    if (shouldEnableCodeCoverage) {
      api.render('./templates/code-coverage');

      // Let's add the playwright-ct-vue package to the devDependencies
      extendPackageJson.devDependencies['@playwright/experimental-ct-vue'] =
        aeDevDependencies['@playwright/experimental-ct-vue'];

      scripts.scripts['test'] += ` && ${packageManager} coverage-report`;
      scripts.scripts['coverage-report'] =
        'nyc report --reporter=html --reporter=text';
    }

    const scriptExtension = supportsTypescript ? 'ts' : 'js';
    // Playwright only offers native support for component testing with Vite
    if (api.hasVite) {
      scripts.scripts['test:component'] =
        `${testEnvCommand} playwright test -c playwright-ct.config.${scriptExtension} --ui`;
      scripts.scripts['test:component:ci'] =
        `${testEnvCommand} playwright test -c playwright-ct.config.${scriptExtension}`;
    }
    extendPackageJson = __mergeDeep(extendPackageJson, scripts);
    api.extendPackageJson(extendPackageJson);

    const gitignorePath = api.resolve.app('.gitignore');

    const playwrightCommentStart = '\n# Playwright';
    let playwrightGitignore = `\n${playwrightCommentStart}\n/test-results/\n/playwright-report/\n/blob-report\n/playwright/.cache/\n`;

    if (shouldEnableCodeCoverage) {
      playwrightGitignore += '\n\n# Coverage\n.nyc_output\n/coverage\n';
    }
    appendToFileIfNotExists(
      gitignorePath,
      playwrightCommentStart,
      playwrightGitignore,
    );

    if (api.prompts.installBrowsers) {
      installPlaywrightBrowsers();
    }

    if (api.prompts.enableCodeCoverage && api.hasWebpack) {
      api.onExitLog(
        "Playwright doesn't support code coverage for Webpack yet. Please use Vite CLI instead.",
      );
    }

    if (await api.hasLint()) {
      api.onExitLog(
        'Check out https://github.com/quasarframework/quasar-testing/tree/dev/packages/e2e-playwright to see how to add proper Playwright linting configuration to your project.',
      );
    }
  } catch (error) {
    console.error('An error occurred while installing the extension:', error);

    process.exit(1);
  }
}
