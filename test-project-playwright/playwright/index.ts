// See https://quasar.dev/start/vite-plugin
import 'quasar/src/css/index.sass';
import '../src/css/app.scss';
import { Quasar, Dialog } from 'quasar';
import { beforeMount } from '@playwright/experimental-ct-vue/hooks';
import '@quasar/extras/material-icons/material-icons.css';
// import '@quasar/extras/mdi-v7/mdi-v7.css';

beforeMount(async ({ app }) => {
  // Setup other stuff you need before mounting the component. You can setup i18n, pinia, etc here.
  // See https://playwright.dev/docs/test-components#frequently-asked-questions
  app.use(Quasar, {
    plugins: {
      // Setup plugins used in your components
      // Notify,
      // Loading
      Dialog,
    },
  });
});
