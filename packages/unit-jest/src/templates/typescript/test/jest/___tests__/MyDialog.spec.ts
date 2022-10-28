import { beforeEach, describe, expect, it } from '@jest/globals';
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-jest';
import { DOMWrapper, mount } from '@vue/test-utils';
import MyDialog from './demo/MyDialog';

installQuasarPlugin();

describe('MyDialog', () => {
  beforeEach(() => {
    mount(MyDialog, {
      data: () => ({
        isDialogOpen: true,
      }),
    });
  });

  it('should mount the document body and expose for testing', () => {
    const wrapper = new DOMWrapper(document.body);

    expect(wrapper.find('.q-dialog').exists()).toBeTruthy();
  });

  it('can check the inner text of the dialog', () => {
    const wrapper = new DOMWrapper(document.body);

    expect(wrapper.find('.q-dialog').html()).toContain(
      'Custom dialog which should be tested',
    );
  });
});
