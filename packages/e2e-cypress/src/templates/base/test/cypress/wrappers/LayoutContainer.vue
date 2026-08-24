<template>
  <q-layout>
    <component :is="component" v-bind="$attrs" />
  </q-layout>
</template>

<script setup<% if (shouldSupportTypeScript) { %> lang="ts"<% } %>>
<% if (shouldSupportTypeScript) { %>
import type { Component } from 'vue';
<% } %>

defineOptions({ inheritAttrs: false });

<% if (shouldSupportTypeScript) { %>
defineProps<{ component: Component }>();
<% } else { %>
defineProps({
  component: {
    type: Object,
    required: true,
  },
});
<% } %>
</script>
