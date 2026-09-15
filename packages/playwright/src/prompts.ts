/**
 * Quasar App Extension prompts script
 * https://quasar.dev/app-extensions/development-guide/prompts-api
 */

import { definePromptsScript } from '#q-app';
import { confirm, cancel, isCancel } from '@clack/prompts';
import type { PromptsAnswers } from './prompt-answers';

export default definePromptsScript(async (): Promise<PromptsAnswers> => {
  const wantsCodeCoverage = await confirm({
    message: 'Enable code coverage?',
    initialValue: false,
  });

  if (isCancel(wantsCodeCoverage)) {
    cancel('Operation cancelled.');
    process.exit(0);
  }

  const wantsDemo = await confirm({
    message:
      'Scaffold the demo suite (example components with stories and tests)?',
    initialValue: true,
  });

  if (isCancel(wantsDemo)) {
    cancel('Operation cancelled.');
    process.exit(0);
  }

  const wantsGithubWorkflow = await confirm({
    message: 'Add a GitHub Actions workflow that runs the tests?',
    initialValue: false,
  });

  if (isCancel(wantsGithubWorkflow)) {
    cancel('Operation cancelled.');
    process.exit(0);
  }

  const wantsBrowserInstall = await confirm({
    message: 'Install Chromium for Playwright now?',
    initialValue: true,
  });

  if (isCancel(wantsBrowserInstall)) {
    cancel('Operation cancelled.');
    process.exit(0);
  }

  return {
    options: [
      ...(wantsCodeCoverage ? ['code-coverage'] : []),
      ...(wantsDemo ? ['demo'] : []),
      ...(wantsGithubWorkflow ? ['github-workflow'] : []),
      ...(wantsBrowserInstall ? ['install-browsers'] : []),
    ],
  };
});
