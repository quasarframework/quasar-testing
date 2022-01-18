import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-jest';
import { describe, expect, it } from '@jest/globals';
import { mount } from '@vue/test-utils';
import MyDialog from './demo/MyDialog';

installQuasarPlugin();

describe('MyDialog', () => {
  it('should mount MyDialog', () => {
    const wrapper = mount(MyDialog, {
      data: () => ({
        isDialogOpen: true,
      }),
    });

    expect(wrapper.exists()).toBe(true);
  });
});
