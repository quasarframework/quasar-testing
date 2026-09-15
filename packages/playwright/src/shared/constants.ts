/** The port the scaffolded playwright.config starts from. */
export const defaultDevServerPort = 8080;

/** Appended to every error about a @quasar/app-vite internal of an unexpected shape. */
export const APP_VITE_SUPPORT_NOTE =
  'The AE supports @quasar/app-vite ^3.8.0, report an issue if your version is in range.';

/** The app path the gallery page is served under, with a trailing slash and no public path. */
export const GALLERY_URL_DIRECTORY = 'playwright/gallery/';

/** The generated types file, written into .quasar/ next to app-vite's own files. */
export const PLAYWRIGHT_TYPES_FILE_NAME = 'playwright.d.ts';

/** The global the gallery page sets, so a boot file can tell it apart from the app. */
export const GALLERY_FLAG = '__QUASAR_PLAYWRIGHT_GALLERY__';
