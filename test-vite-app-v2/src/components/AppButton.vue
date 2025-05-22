<template>
  <q-btn
    :label="label"
    color="positive"
    rounded
    icon="edit"
    @click="$emit('test')"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'QuasarButton',
  props: {
    label: {
      type: String,
    },
  },
  emits: { test: () => true },
});
</script>
