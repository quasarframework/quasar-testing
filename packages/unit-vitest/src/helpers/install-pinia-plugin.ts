import { config } from '@vue/test-utils';
import { cloneDeep } from 'lodash-es';
import { beforeAll, afterAll } from 'vitest';
import { createTestingPinia, TestingOptions } from '@pinia/testing';
import { Plugin } from 'vue';

export function installPinia(options?: Partial<TestingOptions>) {
  const globalConfigBackup = cloneDeep(config.global);

  beforeAll(() => {
    config.global.plugins.unshift(
      // This is needed because typescript will complain othwerwise
      // Probably due to this being a monorepo as this same setup inside a test project did work correctly
      createTestingPinia(options) as unknown as Plugin,
    );
  });

  afterAll(() => {
    config.global = globalConfigBackup;
  });
}
