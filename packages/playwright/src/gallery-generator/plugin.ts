/*
  Vite plugin for the generated gallery. The index script calls generate() on
  every quasar.config read of quasar dev, which writes
  .quasar/playwright-gallery/index.html and main.js. The plugin serves that
  page at the gallery URL, renders main.js again when a story file appears or
  disappears, and copies the page again when the app's template changes.
*/

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import {
  GALLERY_HTML_FILE_NAME,
  GALLERY_MAIN_FILE_NAME,
  GALLERY_OUTPUT_DIRECTORY,
  renderGalleryHtml,
  renderGalleryMain,
  type GalleryMainInput,
} from './render';
import { APP_VITE_SUPPORT_NOTE, GALLERY_URL_DIRECTORY } from '../shared';
import { STORY_FILE_RE, listStoryFiles } from '../story-registry/render';
import { writeIfChanged } from '../write-if-changed';

// The app path of the page, without a leading slash so the match base can
// prefix it.
const GALLERY_PAGE_PATH = `${GALLERY_URL_DIRECTORY}${GALLERY_HTML_FILE_NAME}`;

const NOT_FOUND_CODE = 'ENOENT';

// Only the pathname is ever compared, so any origin works here.
const MATCH_BASE_ORIGIN = 'http://localhost';

// The shape of the vite dev server this plugin uses. The package has no vite
// types of its own.
interface GalleryServer {
  middlewares: {
    use(
      handler: (req: { url?: string }, res: unknown, next: () => void) => void,
    ): unknown;
  };
  watcher: {
    on(
      event: 'add' | 'unlink' | 'change',
      listener: (file: string) => void,
    ): unknown;
  };
}

export interface GalleryFilesPlugin {
  name: string;
  /** Everything this plugin does happens on the dev server. */
  apply: 'serve';
  configureServer: (server: GalleryServer) => void;
}

export interface GalleryFilesOptions {
  appDir: string;
  /** The directories scanned for story files. */
  roots: string[];
  /** <appDir>/playwright/gallery/index.html. The app owns this page after an eject. */
  userGalleryFile: string;
}

/** The quasar.config facts main.js needs. The story files come from the roots. */
type GalleryMainFacts = Omit<GalleryMainInput, 'storyFiles' | 'appDir'>;

export interface GalleryFilesInput extends GalleryMainFacts {
  /** The app's HTML template, an absolute path. */
  templatePath: string;
}

/** What the dev server needs from the last quasar.config read. */
interface LastConfigRead {
  facts: GalleryMainFacts;
  templatePath: string;
  /** The path requests arrive under, the public path reduced to its pathname. */
  matchBase: string;
}

/**
 * Whether the URL asks for the gallery page, query string and hash ignored.
 * The match base is the path requests arrive under, with a trailing slash.
 */
function isGalleryRequest(url: string | undefined, matchBase: string): boolean {
  if (url === undefined) {
    return false;
  }

  const queryStart = url.search(/[?#]/);
  const pathname = queryStart === -1 ? url : url.slice(0, queryStart);

  // This middleware runs before vite's base middleware, so the pathname still
  // starts with the base.
  if (!pathname.startsWith(matchBase)) {
    return false;
  }

  const appPath = pathname.slice(matchBase.length);

  return appPath === GALLERY_PAGE_PATH || appPath === GALLERY_URL_DIRECTORY;
}

/**
 * The request URL to serve, or undefined to leave the request alone.
 * hasUserGallery reports whether the app owns playwright/gallery/index.html,
 * the file an eject creates. Every request of the app reaches this function,
 * so it calls hasUserGallery only after the URL matched.
 */
export function resolveGalleryRequest(
  url: string | undefined,
  hasUserGallery: () => boolean,
  matchBase: string,
): string | undefined {
  if (!isGalleryRequest(url, matchBase) || hasUserGallery()) {
    return undefined;
  }

  // Keeping the base lets vite's base middleware strip it again, so its html
  // middleware sees the file it can serve.
  return `${matchBase}${GALLERY_OUTPUT_DIRECTORY}/${GALLERY_HTML_FILE_NAME}`;
}

/**
 * The path requests arrive under. Vite reduces a full-url base to its pathname
 * for the dev server, and a plain path comes back unchanged.
 */
function toMatchBase(publicPath: string) {
  return new URL(publicPath, MATCH_BASE_ORIGIN).pathname;
}

function isNotFoundError(error: unknown) {
  return (
    error instanceof Error &&
    (error as { code?: string }).code === NOT_FOUND_CODE
  );
}

function readTemplate(templatePath: string) {
  try {
    return readFileSync(templatePath, 'utf8');
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(
        `The gallery reuses ${templatePath}, which does not exist. ${APP_VITE_SUPPORT_NOTE}`,
      );
    }

    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(
      `The gallery could not read ${templatePath}: ${reason}. ${APP_VITE_SUPPORT_NOTE}`,
      { cause: error },
    );
  }
}

export function createGalleryFilesPlugin(options: GalleryFilesOptions) {
  const outDir = path.join(options.appDir, GALLERY_OUTPUT_DIRECTORY);
  const hasUserGallery = () => existsSync(options.userGalleryFile);

  // The watcher renders the files again with what the last config read carried.
  let lastRead: LastConfigRead | undefined;

  function writePage(templatePath: string) {
    const html = renderGalleryHtml({
      template: readTemplate(templatePath),
      templatePath,
    });

    writeIfChanged(path.join(outDir, GALLERY_HTML_FILE_NAME), html);
  }

  function writeMain(facts: GalleryMainFacts) {
    const content = renderGalleryMain({
      ...facts,
      appDir: options.appDir,
      storyFiles: listStoryFiles(options.roots),
    });

    writeIfChanged(path.join(outDir, GALLERY_MAIN_FILE_NAME), content);
  }

  function generate({ templatePath, ...facts }: GalleryFilesInput) {
    writePage(templatePath);

    lastRead = {
      facts,
      templatePath,
      matchBase: toMatchBase(facts.publicPath),
    };
    writeMain(facts);
  }

  const plugin: GalleryFilesPlugin = {
    name: 'quasar-testing-playwright:gallery-generator',
    apply: 'serve',

    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        // Without a config read there is no base to match against, and no
        // generated page either.
        const target =
          lastRead === undefined
            ? undefined
            : resolveGalleryRequest(
                req.url,
                hasUserGallery,
                lastRead.matchBase,
              );

        if (target !== undefined) {
          req.url = target;
        }

        next();
      });

      const regenerateForStory = (file: string) => {
        // The story list only reaches main.js, and only once a config read
        // handed over the facts the file needs.
        if (STORY_FILE_RE.test(file) && lastRead !== undefined) {
          writeMain(lastRead.facts);
        }
      };

      server.watcher.on('add', regenerateForStory);
      server.watcher.on('unlink', regenerateForStory);

      // The page is a copy of the app's template, so an edit to it has to be
      // copied again while the server runs.
      server.watcher.on('change', (file) => {
        if (lastRead !== undefined && file === lastRead.templatePath) {
          writePage(lastRead.templatePath);
        }
      });
    },
  };

  return { plugin, generate };
}
