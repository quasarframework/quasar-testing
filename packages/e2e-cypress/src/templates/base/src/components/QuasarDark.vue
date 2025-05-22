<template>
  <q-card data-cy="dark-card" :dark="$q.dark.isActive">
    {{ $q.dark.isActive ? 'Dark ' : 'Light' }} content

    <q-btn label="Toggle Dark Mode" data-testid="dark-mode-toggle-button" @click="toggleNightMode" />
  </q-card>

</template>

<script<% if (shouldSupportTypeScript) { %> lang="ts"<% } %>>
import { defineComponent } from 'vue';
import { useQuasar } from 'quasar';

export default defineComponent({
  name: 'QuasarDark',
  setup() {
    const $q = useQuasar();

    // TODO: Refactor the Cypress test so that it does not need to test on the instance. Let's avoid such
    // tests in e2e and component tests. It's preferable to have buttons that perform the task than to directly
    // call those methods on the instance. Moreover, Playwright does not encourage nor support access to the instance.
    // See https://kentcdodds.com/blog/testing-implementation-details
    function toggleNightMode() {
      $q.dark.set(!$q.dark.isActive);
    }

    return {
      toggleNightMode
    };
  },
});
</script>
