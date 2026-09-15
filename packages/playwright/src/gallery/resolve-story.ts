/*
  Story id resolution, following Playwright's convention:
  "<path from the app root without .story.*>/<ExportName>", or the path alone
  for a single-file-component story (its default export). A unique run of
  trailing path segments matches too, so "Button/Primary" finds
  "components/Button/Primary". Stories under src/ get ids without the src/
  segment. Stories elsewhere, such as the demo suite under
  test/playwright/demo/, still get the full path.
*/

import { toStoryId } from '../shared';

export type StoryModuleLoader = () => Promise<unknown>;
export type StoryModules = Record<string, StoryModuleLoader>;

export interface StoryLocation {
  file: string;
  exportName: string;
}

const DEFAULT_EXPORT = 'default';

// The AE generates the keys as app-relative posix paths, which is what the
// shared rule takes.
export { toStoryId as storyFileId } from '../shared';

function matchesFileId(fileId: string, id: string) {
  return fileId === id || fileId.endsWith(`/${id}`);
}

function findFiles(files: readonly string[], id: string) {
  return files.filter((file) => matchesFileId(toStoryId(file), id));
}

function ambiguousStoryIdError(storyId: string, candidates: readonly string[]) {
  return new Error(
    `Ambiguous story id "${storyId}": matches ${candidates.join(', ')}`,
  );
}

export function locateStory(
  files: readonly string[],
  storyId: string,
): StoryLocation | undefined {
  const wholeIdMatches = findFiles(files, storyId);
  if (wholeIdMatches.length > 1) {
    throw ambiguousStoryIdError(storyId, wholeIdMatches);
  }

  const wholeIdFile = wholeIdMatches[0];
  const separatorIndex = storyId.lastIndexOf('/');
  if (separatorIndex === -1) {
    return wholeIdFile === undefined
      ? undefined
      : { file: wholeIdFile, exportName: DEFAULT_EXPORT };
  }

  const fileId = storyId.slice(0, separatorIndex);
  const exportName = storyId.slice(separatorIndex + 1);
  const splitMatches = findFiles(files, fileId);
  if (splitMatches.length > 1) {
    throw ambiguousStoryIdError(storyId, splitMatches);
  }

  const splitFile = splitMatches[0];

  // A single-file-component story (matched by the whole id) and a named
  // export in a different file (matched by the split id) can both exist for
  // the same story id. The whole-id match wins. It is an error when the two
  // point at different files.
  if (
    wholeIdFile !== undefined &&
    splitFile !== undefined &&
    wholeIdFile !== splitFile
  ) {
    throw ambiguousStoryIdError(storyId, [wholeIdFile, splitFile]);
  }

  if (wholeIdFile !== undefined) {
    return { file: wholeIdFile, exportName: DEFAULT_EXPORT };
  }

  return splitFile === undefined ? undefined : { file: splitFile, exportName };
}

/**
 * What an id resolved to. An id that names a file but not an export of it is a
 * different mistake from one that names no file, and the message says which.
 */
export type StoryLookup =
  | { outcome: 'story'; story: unknown }
  | { outcome: 'no-file' }
  | {
      outcome: 'no-export';
      file: string;
      exportName: string;
      exportNames: string[];
    };

export async function resolveStory(
  stories: StoryModules,
  storyId: string,
): Promise<StoryLookup> {
  const location = locateStory(Object.keys(stories), storyId);
  if (location === undefined) {
    return { outcome: 'no-file' };
  }

  const loader = stories[location.file];
  if (loader === undefined) {
    return { outcome: 'no-file' };
  }

  const storyModule = (await loader()) as Record<string, unknown>;
  const story = storyModule[location.exportName];
  if (story === undefined || story === null) {
    return {
      outcome: 'no-export',
      file: location.file,
      exportName: location.exportName,
      exportNames: Object.keys(storyModule),
    };
  }

  return { outcome: 'story', story };
}
