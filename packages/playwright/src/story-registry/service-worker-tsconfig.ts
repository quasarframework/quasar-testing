/*
  Keeps the story registry out of the service-worker TypeScript program.
  app-vite includes "./*.d.ts" in .quasar/tsconfig.pwa-sw.json, which picks up
  .quasar/playwright.d.ts. The registry imports every story file. That program
  has no SFC types, so every prop passed to a .vue story fails to type-check.
*/

import { PLAYWRIGHT_TYPES_FILE_NAME } from '../shared';

// The paths of that tsconfig are anchored to .quasar/, where the registry sits.
export const STORY_TYPES_SW_EXCLUDE = `./${PLAYWRIGHT_TYPES_FILE_NAME}`;

interface ServiceWorkerTsConfig {
  exclude?: string[];
}

type ExtendServiceWorkerTsConfig<T extends ServiceWorkerTsConfig> = (
  tsConfig: T,
) => void | T;

/** Wraps the app's pwa.extendPWASwTsConfig hook so the story registry stays out of the service-worker program. */
export function withStoryTypesExcluded<T extends ServiceWorkerTsConfig>(
  userHook: ExtendServiceWorkerTsConfig<T> | undefined,
): ExtendServiceWorkerTsConfig<T> {
  return (tsConfig) => {
    tsConfig.exclude ??= [];

    if (!tsConfig.exclude.includes(STORY_TYPES_SW_EXCLUDE)) {
      tsConfig.exclude.push(STORY_TYPES_SW_EXCLUDE);
    }

    // The app's hook runs last, so it sees the entry and may drop it again.
    return userHook?.(tsConfig);
  };
}
