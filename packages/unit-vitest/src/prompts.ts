/**
 * Quasar App Extension prompts script
 * https://quasar.dev/app-extensions/development-guide/prompts-api
 */

import { definePromptsScript } from '#q-app';
import { cancel, confirm, isCancel } from '@clack/prompts';

export default definePromptsScript(async () => {
  const ui = await confirm({
    message: 'Install Vitest UI? (adds @vitest/ui and a "test:unit:ui" script)',
    initialValue: false,
  });

  if (isCancel(ui)) {
    cancel('Operation cancelled.');
    process.exit(0);
  }

  return { ui };
});
