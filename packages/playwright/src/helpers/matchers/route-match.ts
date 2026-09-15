import { posix } from 'node:path';

/**
 * Cypress testRoute parity: the glob is matched against the hash for hash-mode
 * routers and against the pathname otherwise. The matcher adds the leading "/" or "#/" itself.
 */
export function matchesRoute(url: URL, glob: string): boolean {
  const HASH_MODE_PREFIX = '#/';
  const usesHashModeRouter = url.hash.startsWith(HASH_MODE_PREFIX);

  if (usesHashModeRouter) {
    // Vue Router puts the query string inside the hash in hash mode. One such
    // hash is "#/second?tab=1". Strip the query before matching.
    const queryIndex = url.hash.indexOf('?');
    const hashWithoutQuery =
      queryIndex === -1 ? url.hash : url.hash.slice(0, queryIndex);
    return posix.matchesGlob(hashWithoutQuery, `#/${glob}`);
  }

  return posix.matchesGlob(url.pathname, `/${glob}`);
}
