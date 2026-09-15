/*
  Browser-side gallery runtime. It boots the app the way @quasar/app-vite's
  client entry does, with the gallery host as the root component, and fulfills
  Playwright's gallery contract. window.mount({ story, props }) renders a story
  into #root. It rejects on an unknown story and on a render error.
  window.unmount() removes the story.
  See https://playwright.dev/docs/test-components
*/

import {
  createApp,
  h,
  nextTick,
  shallowRef,
  type App,
  type Component,
  type Plugin,
} from 'vue';
import {
  loadModuleReference,
  runBootFiles,
  validateAppFactory,
  validateAppFactoryResult,
  validateQuasarUserOptions,
  type ModuleReference,
} from './boot';
import { GALLERY_FLAG } from '../shared';
import { resolveStory, storyFileId, type StoryModules } from './resolve-story';
import { computeUrlPath } from './url-path';

export type { ModuleReference } from './boot';
export type { StoryModules } from './resolve-story';

export interface QuasarGalleryOptions {
  /** One entry per story file. The key is the app-relative path, the value imports the file. */
  stories: StoryModules;
  /** The app factory @quasar/app-vite generates, .quasar/<entry>/app.js. */
  appFactory: ModuleReference;
  /** The Quasar options @quasar/app-vite generates, .quasar/<entry>/quasar-user-options.js. */
  quasarUserOptions: ModuleReference;
  /** The app's boot files, in quasar.config order. */
  bootFiles: readonly ModuleReference[];
  /** quasar.config > build > publicPath */
  publicPath: string;
  /** quasar.config > build > vueRouterMode */
  vueRouterMode: 'hash' | 'history';
  /** The element the app mounts into. Defaults to "#q-app", the same element the app uses. */
  mountSelector?: string;
}

interface MountParams {
  story: string;
  props?: Record<string, unknown>;
}

// The gallery entry is a published module. Augmenting the global Window here
// would add mount and unmount to the Window type of every app that imports it.
type GalleryWindow = Window & {
  mount?: (params: MountParams) => Promise<void>;
  unmount?: () => Promise<void>;
};

const DEFAULT_MOUNT_SELECTOR = '#q-app';
const ROOT_ELEMENT_ID = 'root';

const APP_FACTORY_DESCRIPTION = 'the app factory';
const QUASAR_OPTIONS_DESCRIPTION = 'the Quasar options';

function availableStoryFiles(stories: StoryModules) {
  return Object.keys(stories).map(storyFileId).sort().join(', ');
}

export function createQuasarGallery(options: QuasarGalleryOptions) {
  // Boot files read this to skip logic that must not run in the gallery. They
  // are imported through load(), which runs after this line. The cast keeps the
  // global out of the published types.
  (globalThis as Record<string, unknown>)[GALLERY_FLAG] = true;

  // Assigned before anything else can fail, so a boot failure reaches the test
  // as a rejected mount() instead of "window.mount is not a function".
  const galleryWindow = window as GalleryWindow;
  galleryWindow.mount = mount;
  galleryWindow.unmount = unmount;

  const {
    stories,
    appFactory,
    quasarUserOptions,
    bootFiles,
    publicPath,
    vueRouterMode,
    mountSelector = DEFAULT_MOUNT_SELECTOR,
  } = options;

  const story = shallowRef<Component | null>(null);
  const props = shallowRef<Record<string, unknown>>({});
  let renderError: unknown;
  let ready: Promise<App> | undefined;

  // One host app, mounted once. Setting the refs re-renders in place, so
  // component state survives Playwright's update(), which mounts the same story
  // again with new props.
  const host = {
    name: 'QuasarGalleryHost',
    render: () =>
      h(
        'div',
        { id: ROOT_ELEMENT_ID },
        story.value === null ? [] : [h(story.value, props.value)],
      ),
  };

  async function boot(): Promise<App> {
    const createQuasarApp = validateAppFactory(
      await loadModuleReference(appFactory, APP_FACTORY_DESCRIPTION),
      appFactory.path,
    );
    const userOptions = validateQuasarUserOptions(
      await loadModuleReference(quasarUserOptions, QUASAR_OPTIONS_DESCRIPTION),
      quasarUserOptions.path,
    );

    const { app, router, store } = validateAppFactoryResult(
      await createQuasarApp(() => createApp(host), userOptions),
      appFactory.path,
    );

    // The app is the one createApp(host) returned above.
    const vueApp = app as App;

    await runBootFiles(bootFiles, {
      app,
      router,
      store,
      urlPath: computeUrlPath({
        href: location.href,
        origin: location.origin,
        hash: location.hash,
        publicPath,
        vueRouterMode,
      }),
      publicPath,
    });

    // Vue reports render errors here instead of throwing them. A boot file may
    // have installed a handler of its own, so keep it in the chain.
    const bootErrorHandler = vueApp.config.errorHandler;
    vueApp.config.errorHandler = (error, instance, info) => {
      renderError = error;
      bootErrorHandler?.(error, instance, info);
    };

    // RouterLike declares only the method the validation checks. The router
    // @quasar/app-vite creates is a Vue plugin.
    vueApp.use(router as unknown as Plugin);

    const mountElement = document.querySelector(mountSelector);
    if (mountElement === null) {
      throw new Error(
        `Gallery mount element "${mountSelector}" not found in the page`,
      );
    }

    vueApp.mount(mountElement);
    return vueApp;
  }

  async function mount({ story: storyId, props: nextProps }: MountParams) {
    ready ??= boot();
    await ready;

    const lookup = await resolveStory(stories, storyId);

    if (lookup.outcome === 'no-file') {
      throw new Error(
        `Unknown story: ${storyId}. Available story files: ${availableStoryFiles(stories)}`,
      );
    }

    if (lookup.outcome === 'no-export') {
      throw new Error(
        `Unknown story: ${storyId}. ${lookup.file} has no export "${lookup.exportName}". Its exports: ${lookup.exportNames.join(', ')}`,
      );
    }

    renderError = undefined;
    story.value = lookup.story as Component;
    props.value = nextProps ?? {};

    await nextTick();

    if (renderError !== undefined) {
      // Vue hands the render error over as unknown and the test must receive it
      // unwrapped.
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw renderError;
    }
  }

  async function unmount() {
    // A failed boot already rejected mount(). Ignore the rejection here so the
    // cleanup reports nothing and the next mount() boots again.
    const app = await ready?.catch(() => undefined);
    app?.unmount();

    ready = undefined;
    renderError = undefined;
    story.value = null;
    props.value = {};
  }
}
