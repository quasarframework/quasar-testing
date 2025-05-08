<template>
  <q-btn :label="label" color="positive" rounded icon="edit" @click="$emit('test')" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    label: {
      type: String,
    },
  },
  name: 'QuasarButton',
  emits: { test: () => true },
});
</script>
