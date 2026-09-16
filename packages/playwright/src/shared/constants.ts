/** The port the scaffolded playwright.config starts from. */
export const defaultDevServerPort = 8080;

/** Appended to every error about a @quasar/app-vite internal of an unexpected shape. */
export const APP_VITE_SUPPORT_NOTE =
  'The AE supports @quasar/app-vite ^3.8.0, report an issue if your version is in range.';

/** The variable the scaffolded playwright.config sets on the dev server it starts. */
export const AE_SWITCH_VARIABLE = 'QUASAR_TESTING_PLAYWRIGHT';

/** The value AE_SWITCH_VARIABLE carries while Playwright is active. */
export const AE_SWITCH_ON = 'true';

/** The app path the gallery page is served under, with a trailing slash and no public path. */
export const GALLERY_URL_DIRECTORY = 'playwright/gallery/';

/** The generated types file, written into .quasar/ next to app-vite's own files. */
export const PLAYWRIGHT_TYPES_FILE_NAME = 'playwright.d.ts';

/** The global the gallery page sets, so a boot file can tell it apart from the app. */
export const GALLERY_FLAG = '__QUASAR_PLAYWRIGHT_GALLERY__';
