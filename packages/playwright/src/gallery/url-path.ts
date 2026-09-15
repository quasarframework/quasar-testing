/*
  The router-facing URL that boot files receive as urlPath. It is computed the
  way app-vite's client entry computes it, from templates/entry/client-entry.js.
*/

export interface UrlPathInput {
  /** location.href */
  href: string;
  /** location.origin */
  origin: string;
  /** location.hash */
  hash: string;
  /** quasar.config > build > publicPath */
  publicPath: string;
  /** quasar.config > build > vueRouterMode */
  vueRouterMode: 'hash' | 'history';
}

const ROOT_PATH = '/';

export function computeUrlPath({
  href,
  origin,
  hash,
  publicPath,
  vueRouterMode,
}: UrlPathInput): string {
  if (vueRouterMode === 'hash') {
    return hash.slice(1) || ROOT_PATH;
  }

  // app-vite calls String.replace here, which also matches the public path in
  // the middle of the url. The gallery replaces it only at the start.
  const path = href.replace(origin, '');
  if (publicPath === ROOT_PATH || !path.startsWith(publicPath)) {
    return path;
  }

  return ROOT_PATH + path.slice(publicPath.length);
}
