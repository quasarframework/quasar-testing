<template>
  <q-layout>
    <component :is="component" v-bind="$attrs" />
  </q-layout>
</template>

<script<% if (shouldSupportTypeScript) { %> lang="ts"<% } %>>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'LayoutContainer',
  inheritAttrs: false,
  props: {
    component: {
      type: Object,
      required: true,
    },
  },
});
</script>
