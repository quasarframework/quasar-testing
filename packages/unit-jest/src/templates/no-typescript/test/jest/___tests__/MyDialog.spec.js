import { beforeEach, describe, expect, it } from '@jest/globals';
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-jest';
import { DOMWrapper, mount } from '@vue/test-utils';
import { QCard, QCardSection, QDialog } from 'quasar';
import MyDialog from './demo/MyDialog';

installQuasarPlugin({ components: { QDialog, QCard, QCardSection } });

describe('MyDialog', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(MyDialog);
    // Always use `wrapper.vm.myProperty` to access properties
    // returned by setup() or defined into <script setup>
    // See https://test-utils.vuejs.org/api/#vm
    // See https://github.com/vuejs/test-utils/issues/1770#issuecomment-1245751892
    wrapper.vm.isDialogOpen = true;
  });

  it('should mount the document body and expose for testing', () => {
    const bodyWrapper = new DOMWrapper(document.body);

    // `.find()` won't error out even if the element is not found
    expect(bodyWrapper.find('.q-dialog').exists()).toBeTruthy();
  });

  it('can check the inner text of the dialog', () => {
    const bodyWrapper = new DOMWrapper(document.body);

    // `.get()` expects the element to exist, otherwise it throws an error
    expect(bodyWrapper.get('.q-dialog').html()).toContain(
      'Custom dialog which should be tested',
    );
  });
});
