<template>
  <q-layout>
    <component :is="component" />
  </q-layout>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    component: {
      type: Object,
      required: true,
    },
  },
});
</script>
