import { beforeEach } from 'vitest';
import {
  createRouterMock,
  injectRouterMock,
  VueRouterMock,
  RouterMockOptions,
} from 'vue-router-mock';
import { config } from '@vue/test-utils';

// Is something like this useful?
// It might be better doing this inside a `setup-file` as mentioned here:
// https://github.com/posva/vue-router-mock
export function installRouter(options?: RouterMockOptions) {
  beforeEach(() => {
    const router = createRouterMock(options);
    injectRouterMock(router);
  });

  config.plugins.VueWrapper.install(VueRouterMock);
}
