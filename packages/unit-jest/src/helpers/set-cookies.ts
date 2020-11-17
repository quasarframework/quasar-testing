import { Cookies } from 'quasar';
import { ssrContextMock } from './ssr-context-mock';

export function setCookies(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cookies: Record<string, any>,
  ssrContext?: ReturnType<typeof ssrContextMock>,
) {
  const cookieStorage = ssrContext ? Cookies.parseSSR(ssrContext) : Cookies;
  Object.entries(cookies).forEach(([key, value]) => {
    cookieStorage.set(key, value);
  });
}
