/*
  Turns a story file path into a story id. The story registry uses this so
  mount() completes the ids. The gallery runtime uses it so mount() resolves
  them. Both must answer the same for the same file.
*/

export const STORY_FILE_RE = /\.story\.(ts|tsx|js|jsx|vue)$/;

const SRC_PREFIX = 'src/';

/**
 * Only a leading src/ comes off, so
 * "src/components/Button.story.ts" becomes "components/Button" and
 * "test/playwright/demo/QuasarSelect.story.tsx" keeps its full path.
 */
export function toStoryId(appRelativePath: string) {
  const withoutSrc = appRelativePath.startsWith(SRC_PREFIX)
    ? appRelativePath.slice(SRC_PREFIX.length)
    : appRelativePath;

  return withoutSrc.replace(STORY_FILE_RE, '');
}
