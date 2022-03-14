import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-jest';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { DOMWrapper, mount } from '@vue/test-utils';
import MyDialog from './demo/MyDialog';

installQuasarPlugin();

document.body.innerHTML = `
  <div>
    <div id="app"></div>
  </div>
`;

describe('MyDialog', () => {
  beforeEach(() => {
    mount(MyDialog, {
      attachTo: document.getElementById('app'),
      data: () => ({
        isDialogOpen: true,
      }),
    });
  });

  it('should attach the dialog to the document body and allow for testing', () => {
    const documentWrapper = new DOMWrapper(document.body);
    const dialog = documentWrapper.find('.q-dialog');

    expect(dialog.exists()).toBeTruthy();
    expect(dialog.html()).toContain('Custom dialog which should be tested');
  });
});
