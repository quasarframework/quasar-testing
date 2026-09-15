/**
 * Quasar App Extension index/runner script (runs on each dev/build)
 *
 * Docs: https://quasar.dev/app-extensions/development-guide/index-api
 */

import { existsSync } from 'node:fs';
import { defineIndexScript } from '#q-app';
import { createGalleryFilesPlugin } from './gallery-generator/plugin';
import {
  GALLERY_HTML_FILE_NAME,
  GALLERY_MAIN_FILE_NAME,
  GALLERY_OUTPUT_DIRECTORY,
  normalizePublicPath,
  toWebPath,
  type RawBootAsset,
  type RawCssAsset,
} from './gallery-generator/render';
import { normalizePromptsAnswers } from './prompt-answers';
import { withStoryTypesExcluded } from './story-registry/service-worker-tsconfig';
import {
  APP_VITE_SUPPORT_NOTE,
  GALLERY_URL_DIRECTORY,
  PLAYWRIGHT_TYPES_FILE_NAME,
} from './shared';
import { createStoryTypesPlugin } from './story-registry/plugin';

// app-vite defines resolve.entry() with defineHiddenProp, so the public types
// do not list it. It resolves a file inside .quasar/<dev|prod>-<mode>, where
// app-vite writes the generated entry files.
interface AppPathsResolveWithEntry {
  entry: (dir: string) => string;
}

// app-vite imports the sass build of Quasar when one of these files exists
const SASS_VARIABLES_FILES = [
  'css/quasar.variables.scss',
  'css/quasar.variables.sass',
];

// The page app-vite renders the app into. The gallery reuses it as its template.
const INDEX_HTML_TEMPLATE = 'index.html';

// The default app-vite applies later. The index script reads the raw config.
const DEFAULT_VUE_ROUTER_MODE = 'hash';

const GALLERY_MAIN_ENTRY = `${GALLERY_OUTPUT_DIRECTORY}/${GALLERY_MAIN_FILE_NAME}`;

// An app that ejected owns this page. A glob that matches nothing is ignored.
const EJECTED_GALLERY_ENTRY = `${GALLERY_URL_DIRECTORY}${GALLERY_HTML_FILE_NAME}`;

// Where app-vite writes its generated files. The story registry goes here too.
const QUASAR_GENERATED_DIRECTORY = '.quasar';

// The scaffolded playwright.config sets this on the dev server it starts.
const AE_SWITCH_VARIABLE = 'QUASAR_TESTING_PLAYWRIGHT';
const AE_SWITCH_ON = 'true';

// playwright.config sets this, so changing the port there is enough.
const PORT_VARIABLE = 'QUASAR_TESTING_PLAYWRIGHT_PORT';

export default defineIndexScript(async (api) => {
  api.compatibleWith('quasar', '^2.31.0');
  api.compatibleWith('@quasar/app-vite', '^3.8.0');
  api.compatibleWith('vue', '^3.5.0');
  api.compatibleWith('@playwright/test', '^1.63.0');

  const storyRoots = [
    api.resolve.app('src'),
    api.resolve.app('test/playwright'),
  ];

  const galleryFiles = createGalleryFilesPlugin({
    appDir: api.appDir,
    roots: storyRoots,
    userGalleryFile: api.resolve.app(EJECTED_GALLERY_ENTRY),
  });

  // The registry is written on every config read, so quasar prepare produces it
  // for CI and editors, and the Vite plugin refreshes it while the dev server
  // runs. A JavaScript app has no use for it.
  const hasTypescript = await api.hasTypescript();
  const storyTypes = hasTypescript
    ? createStoryTypesPlugin({
        appDir: api.appDir,
        roots: storyRoots,
        outFile: api.resolve.app(
          `${QUASAR_GENERATED_DIRECTORY}/${PLAYWRIGHT_TYPES_FILE_NAME}`,
        ),
      })
    : undefined;

  // Runs on every quasar.config read. The config is still raw, app-vite has not normalized it yet.
  api.extendQuasarConf((conf) => {
    // The scaffolded stories are TSX files. app-vite 3.8 compiles JSX with Vue's
    // runtime when build.vueJsx is set. A value the user chose always wins.
    conf.build ??= {};
    conf.build.vueJsx ??= true;

    // The generated main.js names the dev entry directory. Only the dev server
    // serves the gallery page.
    if (api.ctx.dev) {
      const hasSassVariables = SASS_VARIABLES_FILES.some((file) =>
        existsSync(api.resolve.src(file)),
      );
      const { entry: resolveEntry } = api.ctx.appPaths
        .resolve as unknown as AppPathsResolveWithEntry;

      if (typeof resolveEntry !== 'function') {
        throw new Error(
          `The AE needs appPaths.resolve.entry() of @quasar/app-vite, which this version does not provide. ${APP_VITE_SUPPORT_NOTE}`,
        );
      }

      galleryFiles.generate({
        templatePath: api.resolve.app(INDEX_HTML_TEMPLATE),
        extras: conf.extras ?? [],
        animations: Array.isArray(conf.animations) ? conf.animations : [],
        css: (conf.css ?? []) as RawCssAsset[],
        cssAddon: conf.framework?.cssAddon === true,
        quasarSrcExt: hasSassVariables ? 'sass' : 'css',
        boot: (conf.boot ?? []) as RawBootAsset[],
        appFactoryWebPath: toWebPath(resolveEntry('app.js'), api.appDir),
        quasarUserOptionsWebPath: toWebPath(
          resolveEntry('quasar-user-options.js'),
          api.appDir,
        ),
        publicPath: normalizePublicPath(conf.build.publicPath),
        vueRouterMode: conf.build.vueRouterMode ?? DEFAULT_VUE_ROUTER_MODE,
      });
    }

    if (storyTypes) {
      storyTypes.generate();

      // app-vite includes "./*.d.ts" in the service-worker tsconfig. That picks
      // up the registry, the registry imports every story file, and the
      // service-worker program has no SFC types.
      conf.pwa ??= {};
      conf.pwa.extendPWASwTsConfig = withStoryTypesExcluded(
        conf.pwa.extendPWASwTsConfig,
      );
    }
  });

  // Registered before the environment variable check below, so a plain
  // "quasar dev" still serves the gallery. Playwright reuses such a server
  // through reuseExistingServer.
  api.extendViteConf((viteConf) => ({
    plugins: storyTypes
      ? [galleryFiles.plugin, storyTypes.plugin]
      : [galleryFiles.plugin],

    // Vite scans the html files of the app root for dependencies, and the glob
    // it uses skips dot directories. The generated page sits in .quasar/, so
    // without this entry Vite finds the dependencies of the stories only when
    // the first test loads the page, then re-optimizes and reloads under mount().
    ...(api.ctx.dev
      ? {
          optimizeDeps: {
            entries: [GALLERY_MAIN_ENTRY, EJECTED_GALLERY_ENTRY],

            // Rolldown takes the JSX runtime from `tsconfig.json`, and ignores `jsconfig.json`.
            // So, for JS apps, it uses React's runtime and fails on dependency scan. It doesn't
            // use the app's own JSX options, so we pass them through.
            // https://github.com/vitejs/vite/issues/22057
            ...(viteConf.oxc && viteConf.oxc.jsx
              ? { rolldownOptions: { transform: { jsx: viteConf.oxc.jsx } } }
              : {}),
          },
        }
      : {}),
  }));

  // The switch forces the port, keeps the dev server from opening a browser and
  // turns on the coverage instrumentation. NODE_ENV stays what app-vite sets.
  if (process.env[AE_SWITCH_VARIABLE] !== AE_SWITCH_ON) {
    return;
  }

  const prompts = normalizePromptsAnswers(api.prompts);

  const configuredPort = Number(process.env[PORT_VARIABLE]);
  const hasConfiguredPort =
    Number.isInteger(configuredPort) && configuredPort > 0;

  api.extendQuasarConf(() => ({
    devServer: {
      // Playwright drives its own browsers
      open: false,
      // Without the variable this is a plain "quasar dev", which picks its own port.
      ...(hasConfiguredPort ? { port: configuredPort } : {}),
    },
  }));

  if (prompts.options.includes('code-coverage')) {
    const { default: istanbul } = await import('vite-plugin-istanbul');

    api.extendViteConf(() => ({
      plugins: [istanbul({ forceBuildInstrument: api.ctx.prod })],
    }));
  }
});
