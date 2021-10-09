import { mount } from '@cypress/vue';
import DialogWrapper from 'app/test/cypress/wrappers/DialogWrapper.vue';
import QuasarDialog from './../QuasarDialog.vue';

describe('QuasarDialog', () => {
  it('should show a dialog', () => {
    const message = 'Hello, I am a dialog';
    mount(DialogWrapper, {
      props: {
        component: QuasarDialog,
        componentProps: {
          message,
        },
      },
    });
  });
});
