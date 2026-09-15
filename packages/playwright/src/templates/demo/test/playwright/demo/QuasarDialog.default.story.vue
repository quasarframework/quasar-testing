<script setup<% if (shouldSupportTypeScript) { %> lang="ts"<% } %>>
import { ref } from 'vue';
import QuasarDialog from './QuasarDialog.vue';

// The story holds the state and writes what the test reads into a hidden form
const okCount = ref(0);
</script>

<template>
  <QuasarDialog message="Hello, I am a dialog" @ok="okCount++" />
  <form hidden>
    <input data-testid="ok-count" readonly :value="String(okCount)" />
  </form>
</template>
