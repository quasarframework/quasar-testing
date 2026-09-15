// @vitest-environment happy-dom
import { expect, test } from 'vitest';
import { defineComponent, h, ref } from 'vue';
import { createQuasarGallery, type ModuleReference } from './index';

interface GalleryWindow {
  mount(params: {
    story: string;
    props?: Record<string, unknown>;
  }): Promise<void>;
  unmount(): Promise<void>;
}

function reference(path: string, module: unknown): ModuleReference {
  return { path, load: () => Promise.resolve(module) };
}

// The app factory of @quasar/app-vite calls createAppFn() and returns what it built
const appFactory = reference('/.quasar/dev-spa/app.js', {
  default: (createAppFn: (root: unknown) => unknown) =>
    Promise.resolve({
      app: createAppFn(null),
      router: { push: () => undefined, install: () => undefined },
    }),
});

const quasarUserOptions = reference('/.quasar/dev-spa/quasar-user-options.js', {
  default: {},
});

function setUpPage() {
  document.body.innerHTML = '<div id="q-app"></div>';

  return window as unknown as GalleryWindow;
}

function baseOptions(stories: Record<string, () => Promise<unknown>>) {
  return {
    stories,
    appFactory,
    quasarUserOptions,
    bootFiles: [],
    publicPath: '/',
    vueRouterMode: 'hash' as const,
  };
}

test('rejects an unknown story and lists the story files', async () => {
  const galleryWindow = setUpPage();
  createQuasarGallery(
    baseOptions({
      'src/components/Button.story.tsx': () =>
        Promise.resolve({ Primary: () => null }),
    }),
  );

  await expect(
    galleryWindow.mount({ story: 'components/Missing' }),
  ).rejects.toThrow(
    'Unknown story: components/Missing. Available story files: components/Button',
  );
});

test('names the exports when only the export name is wrong', async () => {
  const galleryWindow = setUpPage();
  createQuasarGallery(
    baseOptions({
      'src/components/Button.story.tsx': () =>
        Promise.resolve({ Primary: () => null, Secondary: () => null }),
    }),
  );

  // A JavaScript app has no registry to catch this, so the message has to
  await expect(
    galleryWindow.mount({ story: 'components/Button/Primaryy' }),
  ).rejects.toThrow(
    'Unknown story: components/Button/Primaryy. src/components/Button.story.tsx has no export "Primaryy". Its exports: Primary, Secondary',
  );
});

test('rejects with the error a story throws while rendering', async () => {
  const galleryWindow = setUpPage();
  const Broken = () => {
    throw new Error('the story is broken');
  };
  createQuasarGallery(
    baseOptions({
      'src/Broken.story.tsx': () => Promise.resolve({ Default: Broken }),
    }),
  );

  await expect(
    galleryWindow.mount({ story: 'Broken/Default' }),
  ).rejects.toThrow('the story is broken');
});

test('a boot failure reaches the test as a rejected mount', async () => {
  const galleryWindow = setUpPage();
  createQuasarGallery({
    ...baseOptions({
      'src/X.story.tsx': () => Promise.resolve({ Default: () => null }),
    }),
    bootFiles: [
      reference('@/boot/apollo', {
        default: () => {
          throw new Error('missing API key');
        },
      }),
    ],
  });

  // Not "window.mount is not a function". The functions are assigned before
  // anything that can fail, which is the behavior this test pins.
  expect(typeof galleryWindow.mount).toBe('function');
  await expect(galleryWindow.mount({ story: 'X/Default' })).rejects.toThrow(
    'Boot file "@/boot/apollo" threw: missing API key',
  );
});

test('passes the props through and preserves state across a re-mount', async () => {
  const galleryWindow = setUpPage();
  let setupCalls = 0;
  const Story = defineComponent({
    props: { label: { type: String, required: true } },
    setup(props) {
      setupCalls += 1;
      const clicks = ref(0);

      return () =>
        h(
          'button',
          { onClick: () => clicks.value++ },
          `${props.label}:${clicks.value}`,
        );
    },
  });
  createQuasarGallery(
    baseOptions({
      'src/S.story.tsx': () => Promise.resolve({ Default: Story }),
    }),
  );

  await galleryWindow.mount({ story: 'S/Default', props: { label: 'first' } });

  const button = document.querySelector('#root button');
  expect(button?.textContent).toBe('first:0');

  (button as HTMLButtonElement).click();
  await galleryWindow.mount({ story: 'S/Default', props: { label: 'second' } });

  // Playwright's update() is window.mount() again. The props change, the
  // component instance does not, so its state survives.
  expect(document.querySelector('#root button')?.textContent).toBe('second:1');
  expect(setupCalls).toBe(1);
});

test('unmount clears the root and the next mount boots again', async () => {
  const galleryWindow = setUpPage();
  let factoryCalls = 0;
  createQuasarGallery({
    ...baseOptions({
      'src/X.story.tsx': () => Promise.resolve({ Default: () => h('p', 'x') }),
    }),
    appFactory: {
      path: appFactory.path,
      load: () => {
        factoryCalls += 1;

        return appFactory.load();
      },
    },
  });

  await galleryWindow.mount({ story: 'X/Default' });
  await galleryWindow.unmount();

  expect(document.querySelector('#root')).toBe(null);

  await galleryWindow.mount({ story: 'X/Default' });

  expect(factoryCalls).toBe(2);
  expect(document.querySelector('#root p')?.textContent).toBe('x');
});
