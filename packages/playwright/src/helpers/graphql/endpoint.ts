export type GraphqlEndpoint = string | RegExp | ((url: URL) => boolean);

const STATEFUL_REGEXP_FLAGS = /[gy]/g;

function parseAbsoluteUrl(value: string): URL | undefined {
  try {
    return new URL(value);
  } catch {
    return undefined;
  }
}

/**
 * A pathname matches url.pathname on any origin. An absolute URL matches its
 * origin and pathname. A RegExp tests the href. A function is the matcher.
 */
export function createEndpointMatcher(
  endpoint: GraphqlEndpoint,
): (url: URL) => boolean {
  if (typeof endpoint === 'function') {
    return endpoint;
  }

  if (endpoint instanceof RegExp) {
    // A global or sticky RegExp keeps lastIndex between test() calls. The copy
    // drops those flags, so every call starts from the same place.
    const pattern = new RegExp(
      endpoint.source,
      endpoint.flags.replace(STATEFUL_REGEXP_FLAGS, ''),
    );

    return (url) => pattern.test(url.href);
  }

  const absolute = parseAbsoluteUrl(endpoint);
  if (absolute !== undefined) {
    return (url) =>
      url.origin === absolute.origin && url.pathname === absolute.pathname;
  }

  const pathname = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  return (url) => url.pathname === pathname;
}

/** The URL execute() posts to. */
export function resolveApiUrl(
  endpoint: GraphqlEndpoint,
  apiUrl: string | undefined,
  baseURL: string | undefined,
): string {
  if (apiUrl !== undefined) {
    return apiUrl;
  }

  if (typeof endpoint !== 'string') {
    throw new Error(
      'graphql.execute() needs the graphqlApiUrl option when graphqlEndpoint is a RegExp or a function.',
    );
  }

  if (parseAbsoluteUrl(endpoint) !== undefined) {
    return endpoint;
  }

  if (baseURL === undefined) {
    throw new Error(
      `graphql.execute() needs a baseURL to resolve the endpoint "${endpoint}", or the graphqlApiUrl option.`,
    );
  }

  return new URL(endpoint, baseURL).href;
}
