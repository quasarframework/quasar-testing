/**
 * Quasar App Extension prompts script
 * https://quasar.dev/app-extensions/development-guide/prompts-api
 */

import { definePromptsScript } from '#q-app';
import { text, confirm, cancel, isCancel } from '@clack/prompts';
import { enforcedDevServerPort } from './shared';

export interface PromptsAnswers {
  port: number;
  options: string[];
}

// The answers come from quasar.extensions.json, which can contain invalid
// values due to user edits or older AE versions. So, we normalize them.
export function normalizePromptsAnswers(
  prompts: Record<string, unknown>,
): PromptsAnswers {
  const rawOptions = prompts['options'];

  return {
    port: Number(prompts['port']) || enforcedDevServerPort,
    options: Array.isArray(rawOptions)
      ? rawOptions.filter(
          (option: unknown): option is string => typeof option === 'string',
        )
      : [],
  };
}

export default definePromptsScript(async (): Promise<PromptsAnswers> => {
  const port = await text({
    message: 'Choose which port the app will be served when run for Cypress:',
    initialValue: String(enforcedDevServerPort),
    validate: (value) =>
      /^\d+$/.test(value ?? '') ? undefined : 'Enter a valid port number',
  });

  if (isCancel(port)) {
    cancel('Operation cancelled.');
    process.exit(0);
  }

  const wantsCodeCoverage = await confirm({
    message: 'Enable code coverage?',
    initialValue: false,
  });

  if (isCancel(wantsCodeCoverage)) {
    cancel('Operation cancelled.');
    process.exit(0);
  }

  return {
    port: Number(port),
    options: wantsCodeCoverage ? ['code-coverage'] : [],
  };
});
