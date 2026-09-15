<script setup<% if (shouldSupportTypeScript) { %> lang="ts"<% } %>>
import QuasarDrawer from './QuasarDrawer.vue';
</script>

<template>
  <!-- QDrawer needs a QLayout ancestor -->
  <q-layout view="lHh Lpr lFf">
    <QuasarDrawer />
  </q-layout>
</template>
