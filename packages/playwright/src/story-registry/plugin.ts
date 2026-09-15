/*
  Vite plugin keeping .quasar/playwright.d.ts up to date. The index
  script calls generate() on every quasar.config read. The plugin renders the
  file again when a story file appears or disappears under the dev server.
*/

import {
  STORY_FILE_RE,
  listStoryFiles,
  renderStoryTypes,
  type StoryTypesOptions,
} from './render';
import { writeIfChanged } from '../write-if-changed';

// The shape of the vite dev server this plugin uses. The package has no vite
// types of its own.
interface WatchingServer {
  watcher: {
    on(event: 'add' | 'unlink', listener: (file: string) => void): unknown;
  };
}

export interface StoryTypesPlugin {
  name: string;
  /** Everything this plugin does happens on the dev server. */
  apply: 'serve';
  configureServer: (server: WatchingServer) => void;
}

export function createStoryTypesPlugin(options: StoryTypesOptions) {
  function generate() {
    const content = renderStoryTypes(listStoryFiles(options.roots), options);

    writeIfChanged(options.outFile, content);
  }

  const plugin: StoryTypesPlugin = {
    name: 'quasar-testing-playwright:story-registry',
    apply: 'serve',

    configureServer(server) {
      const regenerateForStory = (file: string) => {
        if (STORY_FILE_RE.test(file)) {
          generate();
        }
      };

      server.watcher.on('add', regenerateForStory);
      server.watcher.on('unlink', regenerateForStory);
    },
  };

  return { plugin, generate };
}
