/**
 * Quasar App Extension install script
 * https://quasar.dev/app-extensions/development-guide/install-api
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineInstallScript } from '#q-app';
import spawn from 'nano-spawn';
import { renderWorkflow } from './github-workflow';
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
import { normalizePromptsAnswers } from './prompt-answers';
import { defaultDevServerPort } from './shared';

// devDependencies is the version source because peerDependencies can hold
// ranges spanning multiple majors.
const { version: aeVersion, devDependencies: aeDevDependencies } = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf-8'),
) as { version: string; devDependencies: Partial<Record<string, string>> };

const WORKFLOW_FILE = '.github/workflows/playwright.yml';
const DEMO_TEMPLATE_DIR = './templates/demo';

// Every release is tagged playwright-v<version>, so the link shows the README
// of the installed version.
const LINTING_DOCS_URL = `https://github.com/quasarframework/quasar-testing/tree/playwright-v${aeVersion}/packages/playwright#linting`;

export default defineInstallScript(async (api) => {
  api.compatibleWith('quasar', '^2.31.0');
  api.compatibleWith('@quasar/app-vite', '^3.8.0');
  api.compatibleWith('vue', '^3.5.0');

  const prompts = normalizePromptsAnswers(api.prompts);
  const shouldSupportTypeScript = await api.hasTypescript();
  const shouldAddCodeCoverage = prompts.options.includes('code-coverage');
  const shouldScaffoldDemo = prompts.options.includes('demo');
  const shouldAddGithubWorkflow = prompts.options.includes('github-workflow');
  const shouldInstallBrowsers = prompts.options.includes('install-browsers');

  api.render(`./templates/${shouldSupportTypeScript ? '' : 'no-'}typescript`, {
    devServerPort: defaultDevServerPort,
    shouldAddCodeCoverage,
  });

  if (shouldScaffoldDemo) {
    const demoScope = {
      shouldSupportTypeScript,
      // Renders the text in a TypeScript app only. The demo files use it for a
      // type annotation inside a line.
      ts: (text: string) => (shouldSupportTypeScript ? text : ''),
    };
    const demoTemplateDir = fileURLToPath(
      new URL(`${DEMO_TEMPLATE_DIR}/`, import.meta.url),
    );

    // renderFile() takes the target name, so a JavaScript app gets .js and
    // .jsx files from the one demo tree.
    for (const file of listFiles(demoTemplateDir)) {
      api.renderFile(
        `${DEMO_TEMPLATE_DIR}/${file}`,
        demoTargetPath(file, shouldSupportTypeScript),
        demoScope,
      );
    }

    api.onExitLog(
      'The demo suite uses the Dialog plugin. Make sure quasar.config file > framework > plugins has "Dialog".',
    );
  }

  const shouldAddEslintPlugin = api.hasPackage('eslint');

  api.extendPackageJson({
    // pnpm does not expose transitive dependencies. Scripts and app imports
    // need each package listed here.
    devDependencies: pickDevDependencies(
      [
        // The users control the Playwright version
        '@playwright/test',

        // The coverage report script uses it
        ...(shouldAddCodeCoverage ? ['nyc'] : []),

        // Optional. The user picks the version.
        ...(shouldAddEslintPlugin ? ['eslint-plugin-playwright'] : []),
      ],
      aeDevDependencies,
    ),
    scripts: {
      test: 'echo "See package.json => scripts for available tests." && exit 0',
      'test:e2e': 'playwright test --project=e2e --ui',
      'test:e2e:ci': 'playwright test --project=e2e',
      'test:component': 'playwright test --project=components --ui',
      'test:component:ci': 'playwright test --project=components',
      'test:report': 'playwright show-report',
      ...(shouldAddCodeCoverage
        ? {
            'test:coverage:report': 'nyc report',
          }
        : {}),
    },
  });

  const gitignorePath = api.resolve.app('.gitignore');
  appendGitignoreEntries(gitignorePath, [
    'test-results/',
    'playwright-report/',
    'blob-report/',
  ]);

  if (shouldAddCodeCoverage) {
    api.render('./templates/code-coverage');
    appendGitignoreEntries(gitignorePath, ['.nyc_output', 'coverage/']);
  }

  if (shouldAddGithubWorkflow) {
    const workflowPath = api.resolve.app(WORKFLOW_FILE);

    if (existsSync(workflowPath)) {
      // The user edits the workflow after it is scaffolded. Installing again keeps those edits.
      api.onExitLog(`${WORKFLOW_FILE} already exists, it was left as it is.`);
    } else {
      // The workflow names the package manager app-vite detected. The Node
      // version comes from the app's files and the directory from its git root.
      const workingDirectory = detectWorkingDirectory(api.appDir);

      mkdirSync(path.dirname(workflowPath), { recursive: true });
      writeFileSync(
        workflowPath,
        renderWorkflow({
          packageManager: await api.getNodePackagerName(),
          nodeVersionSource: detectNodeVersionSource(api.appDir),
          hasPackageManagerField: hasPackageManagerField(api.appDir),
          lockfileLocation: detectLockfileLocation(api.appDir),
          isYarnBerry: detectYarnBerry(api.appDir),
          shouldAddCodeCoverage,
          workingDirectory,
        }),
      );

      if (workingDirectory !== '') {
        api.onExitLog(
          `GitHub reads workflows from the repository root only. Move ${WORKFLOW_FILE} to the .github/workflows/ of your repository root, it already runs the tests in "${workingDirectory}".`,
        );
      }
    }
  }

  if (shouldInstallBrowsers) {
    const { command, args } = browserInstallCommand(
      await api.getNodePackagerName(),
    );
    const commandLine = [command, ...args].join(' ');

    try {
      // Inherited stdio, so the user sees the download progress.
      await spawn(command, args, { cwd: api.appDir, stdio: 'inherit' });
    } catch {
      api.onExitLog(
        `The browser install did not finish. Run it again yourself: "${commandLine}".`,
      );
    }
  } else {
    api.onExitLog(
      'Install Chromium before running the tests: "npx playwright install chromium" (pnpm: "pnpm exec playwright install chromium"). The scaffolded config runs Chromium alone.',
    );
  }

  if (shouldAddEslintPlugin || api.hasPackage('oxlint')) {
    api.onExitLog(
      `Check out ${LINTING_DOCS_URL} to set up ESLint or oxlint for the Playwright files.`,
    );
  }
});
