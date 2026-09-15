import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  utimesSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { expect, onTestFinished, test } from 'vitest';
import {
  createGalleryFilesPlugin,
  resolveGalleryRequest,
  type GalleryFilesInput,
} from './plugin';

const OLD_MTIME_SECONDS = 1000000000;
const OLD_MTIME_MS = OLD_MTIME_SECONDS * 1000;
const GENERATED_HTML_URL_PATH = '/.quasar/playwright-gallery/index.html';
const ROOT_PUBLIC_PATH = '/';
const NESTED_PUBLIC_PATH = '/my-app/';

const TEMPLATE = `<!DOCTYPE html>
<html>
  <head><title><%= productName %></title></head>
  <body>
    <!-- quasar:entry-point -->
  </body>
</html>
`;

function createApp() {
  const appDir = mkdtempSync(path.join(tmpdir(), 'gallery-generator-plugin-'));
  onTestFinished(() => rmSync(appDir, { recursive: true, force: true }));
  const srcDir = path.join(appDir, 'src');
  const outDir = path.join(appDir, '.quasar/playwright-gallery');
  const templatePath = path.join(appDir, 'index.html');

  mkdirSync(path.join(srcDir, 'components'), { recursive: true });
  writeFileSync(templatePath, TEMPLATE);

  const input: GalleryFilesInput = {
    templatePath,
    extras: [],
    animations: [],
    css: [],
    cssAddon: false,
    quasarSrcExt: 'css',
    boot: [],
    appFactoryWebPath: '/.quasar/dev-spa/app.js',
    quasarUserOptionsWebPath: '/.quasar/dev-spa/quasar-user-options.js',
    publicPath: '/',
    vueRouterMode: 'history',
  };

  return {
    appDir,
    srcDir,
    input,
    options: {
      appDir,
      roots: [srcDir],
      userGalleryFile: path.join(appDir, 'playwright/gallery/index.html'),
    },
    htmlFile: path.join(outDir, 'index.html'),
    mainFile: path.join(outDir, 'main.js'),
  };
}

function ageFile(file: string) {
  utimesSync(file, OLD_MTIME_SECONDS, OLD_MTIME_SECONDS);
}

type WatcherEvent = 'add' | 'unlink' | 'change';

/** Collects what the plugin registers on a dev server, keyed by event. */
function createServerRecorder() {
  const watcherEvents: WatcherEvent[] = [];
  const listenersByEvent = new Map<
    WatcherEvent,
    Array<(file: string) => void>
  >();
  const middlewares: Array<
    (req: { url?: string }, res: unknown, next: () => void) => void
  > = [];

  return {
    watcherEvents,
    middlewares,
    /** Drives every listener registered for the event, as chokidar would. */
    emit: (event: WatcherEvent, file: string) => {
      for (const listener of listenersByEvent.get(event) ?? []) {
        listener(file);
      }
    },
    server: {
      middlewares: {
        use: (handler: (typeof middlewares)[number]) =>
          middlewares.push(handler),
      },
      watcher: {
        on: (event: WatcherEvent, listener: (file: string) => void) => {
          watcherEvents.push(event);
          const forEvent = listenersByEvent.get(event) ?? [];
          forEvent.push(listener);

          return listenersByEvent.set(event, forEvent);
        },
      },
    },
  };
}

test('resolveGalleryRequest serves the generated page for the gallery url', () => {
  expect(
    resolveGalleryRequest(
      '/playwright/gallery/index.html',
      () => false,
      ROOT_PUBLIC_PATH,
    ),
  ).toBe(GENERATED_HTML_URL_PATH);
});

test('resolveGalleryRequest serves the generated page for the gallery directory', () => {
  expect(
    resolveGalleryRequest(
      '/playwright/gallery/',
      () => false,
      ROOT_PUBLIC_PATH,
    ),
  ).toBe(GENERATED_HTML_URL_PATH);
});

test('resolveGalleryRequest ignores the query string', () => {
  expect(
    resolveGalleryRequest(
      '/playwright/gallery/index.html?story=Button',
      () => false,
      ROOT_PUBLIC_PATH,
    ),
  ).toBe(GENERATED_HTML_URL_PATH);
  expect(
    resolveGalleryRequest(
      '/playwright/gallery/#/route',
      () => false,
      ROOT_PUBLIC_PATH,
    ),
  ).toBe(GENERATED_HTML_URL_PATH);
});

test('resolveGalleryRequest leaves every other request alone', () => {
  expect(resolveGalleryRequest(undefined, () => false, ROOT_PUBLIC_PATH)).toBe(
    undefined,
  );
  expect(
    resolveGalleryRequest('/index.html', () => false, ROOT_PUBLIC_PATH),
  ).toBe(undefined);
  expect(
    resolveGalleryRequest('/playwright/gallery', () => false, ROOT_PUBLIC_PATH),
  ).toBe(undefined);
  expect(
    resolveGalleryRequest(
      '/playwright/gallery/main.js',
      () => false,
      ROOT_PUBLIC_PATH,
    ),
  ).toBe(undefined);
  expect(
    resolveGalleryRequest(
      '/src/components/Button.story.tsx',
      () => false,
      ROOT_PUBLIC_PATH,
    ),
  ).toBe(undefined);
});

test('resolveGalleryRequest leaves the request alone when the app has its own gallery', () => {
  expect(
    resolveGalleryRequest(
      '/playwright/gallery/index.html',
      () => true,
      ROOT_PUBLIC_PATH,
    ),
  ).toBe(undefined);
});

test('resolveGalleryRequest keeps the custom public path on the target', () => {
  expect(
    resolveGalleryRequest(
      '/my-app/playwright/gallery/index.html',
      () => false,
      NESTED_PUBLIC_PATH,
    ),
  ).toBe('/my-app/.quasar/playwright-gallery/index.html');
  expect(
    resolveGalleryRequest(
      '/my-app/playwright/gallery/',
      () => false,
      NESTED_PUBLIC_PATH,
    ),
  ).toBe('/my-app/.quasar/playwright-gallery/index.html');
  expect(
    resolveGalleryRequest(
      '/playwright/gallery/index.html',
      () => false,
      NESTED_PUBLIC_PATH,
    ),
  ).toBe(undefined);
  expect(
    resolveGalleryRequest(
      '/other/playwright/gallery/index.html',
      () => false,
      NESTED_PUBLIC_PATH,
    ),
  ).toBe(undefined);
});

test('does not touch the filesystem for a request that is not the gallery', () => {
  let checks = 0;
  const hasUserGallery = () => {
    checks += 1;

    return false;
  };

  resolveGalleryRequest('/src/main.ts', hasUserGallery, ROOT_PUBLIC_PATH);
  expect(checks).toBe(0);

  resolveGalleryRequest(
    '/playwright/gallery/',
    hasUserGallery,
    ROOT_PUBLIC_PATH,
  );
  expect(checks).toBe(1);
});

test('generate writes the page and the main file', () => {
  const { input, options, htmlFile, mainFile } = createApp();

  createGalleryFilesPlugin(options).generate(input);

  const html = readFileSync(htmlFile, 'utf8');
  expect(html).toMatch(/<div id="q-app"><\/div>/);
  expect(html).toMatch(/\/\.quasar\/playwright-gallery\/main\.js/);
  expect(html).toMatch(/<%= productName %>/);

  const main = readFileSync(mainFile, 'utf8');
  expect(main).toMatch(/createQuasarGallery\(\{/);
  expect(main).toMatch(/'\/\.quasar\/dev-spa\/app\.js'/);
});

test('generate writes a root-absolute script tag under any public path', () => {
  const { input, options, htmlFile } = createApp();

  createGalleryFilesPlugin(options).generate({
    ...input,
    publicPath: NESTED_PUBLIC_PATH,
  });

  // Vite's dev html transform joins the base onto the src, so the tag carries none
  expect(readFileSync(htmlFile, 'utf8')).toMatch(
    /<script type="module" src="\/\.quasar\/playwright-gallery\/main\.js"><\/script>/,
  );
});

test('generate leaves identical files alone', () => {
  const { input, options, htmlFile, mainFile } = createApp();

  const { generate } = createGalleryFilesPlugin(options);
  generate(input);
  ageFile(htmlFile);
  ageFile(mainFile);

  generate(input);

  expect(statSync(htmlFile).mtimeMs).toBe(OLD_MTIME_MS);
  expect(statSync(mainFile).mtimeMs).toBe(OLD_MTIME_MS);
});

test('generate throws when the template does not exist', () => {
  const { appDir, input, options } = createApp();
  const templatePath = path.join(appDir, 'missing.html');

  const { generate } = createGalleryFilesPlugin(options);

  expect(() => generate({ ...input, templatePath })).toThrow(
    new Error(
      `The gallery reuses ${templatePath}, which does not exist. The AE supports @quasar/app-vite ^3.8.0, report an issue if your version is in range.`,
    ),
  );
});

test('generate reports a template it cannot read', () => {
  const { appDir, input, options } = createApp();
  const templatePath = path.join(appDir, 'template-directory');

  mkdirSync(templatePath);
  const { generate } = createGalleryFilesPlugin(options);

  expect(() => generate({ ...input, templatePath })).toThrow(
    new RegExp(`^The gallery could not read ${templatePath}: .+\\.`),
  );
});

test('generate lists the story files of the roots', () => {
  const { srcDir, input, options, mainFile } = createApp();

  const { generate } = createGalleryFilesPlugin(options);
  generate(input);

  expect(readFileSync(mainFile, 'utf8')).not.toMatch(/Button\.story\.tsx/);

  writeFileSync(path.join(srcDir, 'components/Button.story.tsx'), '');
  generate(input);

  expect(readFileSync(mainFile, 'utf8')).toMatch(
    /'src\/components\/Button\.story\.tsx': \(\) => import\('\/src\/components\/Button\.story\.tsx'\)/,
  );
});

/** The one middleware the plugin registered. */
function onlyMiddleware(
  middlewares: Array<
    (req: { url?: string }, res: unknown, next: () => void) => void
  >,
) {
  expect(middlewares).toHaveLength(1);

  const [middleware] = middlewares;
  if (middleware === undefined) {
    throw new Error('The plugin registered no middleware');
  }

  return middleware;
}

/** Runs the plugin's middleware over a request and reports what it did. */
function runMiddleware(
  middleware: (req: { url?: string }, res: unknown, next: () => void) => void,
  url: string,
) {
  const request = { url };
  let nextCalls = 0;
  middleware(request, {}, () => {
    nextCalls += 1;
  });

  return { url: request.url, nextCalls };
}

test('the middleware points the gallery request at the generated page', () => {
  const { input, options } = createApp();

  const { plugin, generate } = createGalleryFilesPlugin(options);
  generate(input);

  const { server, middlewares } = createServerRecorder();
  plugin.configureServer(server);

  const middleware = onlyMiddleware(middlewares);

  expect(
    runMiddleware(middleware, '/playwright/gallery/index.html'),
  ).toStrictEqual({
    url: '/.quasar/playwright-gallery/index.html',
    nextCalls: 1,
  });
  expect(runMiddleware(middleware, '/src/main.ts')).toStrictEqual({
    url: '/src/main.ts',
    nextCalls: 1,
  });
});

test('the middleware keeps a custom public path on the rewritten url', () => {
  const { input, options } = createApp();

  const { plugin, generate } = createGalleryFilesPlugin(options);
  generate({ ...input, publicPath: NESTED_PUBLIC_PATH });

  const { server, middlewares } = createServerRecorder();
  plugin.configureServer(server);

  const middleware = onlyMiddleware(middlewares);

  expect(
    runMiddleware(middleware, '/my-app/playwright/gallery/index.html'),
  ).toStrictEqual({
    url: '/my-app/.quasar/playwright-gallery/index.html',
    nextCalls: 1,
  });

  // Without the public path the request belongs to another app
  expect(
    runMiddleware(middleware, '/playwright/gallery/index.html'),
  ).toStrictEqual({
    url: '/playwright/gallery/index.html',
    nextCalls: 1,
  });
});

test('the middleware leaves every request alone before the first config read', () => {
  const { options } = createApp();

  const { plugin } = createGalleryFilesPlugin(options);
  const { server, middlewares } = createServerRecorder();
  plugin.configureServer(server);

  const middleware = onlyMiddleware(middlewares);

  expect(
    runMiddleware(middleware, '/playwright/gallery/index.html'),
  ).toStrictEqual({
    url: '/playwright/gallery/index.html',
    nextCalls: 1,
  });
});

test('the middleware leaves the request alone when the app has its own gallery', () => {
  const { input, options } = createApp();

  mkdirSync(path.dirname(options.userGalleryFile), { recursive: true });
  writeFileSync(options.userGalleryFile, '');

  const { plugin, generate } = createGalleryFilesPlugin(options);
  generate(input);

  const { server, middlewares } = createServerRecorder();
  plugin.configureServer(server);

  const middleware = onlyMiddleware(middlewares);

  expect(
    runMiddleware(middleware, '/playwright/gallery/index.html'),
  ).toStrictEqual({
    url: '/playwright/gallery/index.html',
    nextCalls: 1,
  });
});

test('the watcher rewrites the main file for story files only', () => {
  const { srcDir, input, options, htmlFile, mainFile } = createApp();

  const { plugin, generate } = createGalleryFilesPlugin(options);
  const { server, watcherEvents, emit } = createServerRecorder();
  plugin.configureServer(server);

  expect(watcherEvents).toStrictEqual(['add', 'unlink', 'change']);

  generate(input);
  ageFile(htmlFile);
  ageFile(mainFile);
  writeFileSync(path.join(srcDir, 'components/Button.story.tsx'), '');

  emit('add', path.join(srcDir, 'components/README.md'));
  emit('unlink', path.join(srcDir, 'components/README.md'));
  expect(statSync(mainFile).mtimeMs).toBe(OLD_MTIME_MS);

  emit('add', path.join(srcDir, 'components/Button.story.tsx'));
  expect(readFileSync(mainFile, 'utf8')).toMatch(/Button\.story\.tsx/);

  // The page does not list the stories, so the watcher never rewrites it.
  expect(statSync(htmlFile).mtimeMs).toBe(OLD_MTIME_MS);
});

test('the watcher does nothing before the first generate', () => {
  const { srcDir, options, mainFile } = createApp();

  const { plugin } = createGalleryFilesPlugin(options);
  const { server, emit } = createServerRecorder();
  plugin.configureServer(server);

  writeFileSync(path.join(srcDir, 'components/Button.story.tsx'), '');
  emit('add', path.join(srcDir, 'components/Button.story.tsx'));

  expect(existsSync(mainFile)).toBe(false);
});

test('the middleware matches under the path of a full-url public path', () => {
  const { input, options } = createApp();

  const { plugin, generate } = createGalleryFilesPlugin(options);
  generate({ ...input, publicPath: 'https://cdn.example.com/app/' });

  const { server, middlewares } = createServerRecorder();
  plugin.configureServer(server);

  const middleware = onlyMiddleware(middlewares);

  // Vite reduces a full-url base to its pathname for the dev server
  expect(
    runMiddleware(middleware, '/app/playwright/gallery/index.html'),
  ).toStrictEqual({
    url: '/app/.quasar/playwright-gallery/index.html',
    nextCalls: 1,
  });
});

test('the watcher copies the page again when the template changes', () => {
  const { appDir, input, options, htmlFile, mainFile } = createApp();

  const { plugin, generate } = createGalleryFilesPlugin(options);
  const { server, emit } = createServerRecorder();
  plugin.configureServer(server);

  generate(input);
  ageFile(htmlFile);
  ageFile(mainFile);

  emit('change', path.join(appDir, 'src/other.html'));
  expect(statSync(htmlFile).mtimeMs).toBe(OLD_MTIME_MS);

  writeFileSync(
    input.templatePath,
    TEMPLATE.replace('<html>', '<html lang="en">'),
  );
  emit('change', input.templatePath);

  expect(readFileSync(htmlFile, 'utf8')).toMatch(/<html lang="en">/);
  // A template change rewrites the page only. main.js is left alone.
  expect(statSync(mainFile).mtimeMs).toBe(OLD_MTIME_MS);
});
