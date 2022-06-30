<template>
  <q-checkbox data-cy="checkbox" v-model="checked" />
  <q-toggle data-cy="toggle" v-model="toggled" />

  <q-radio v-model="selected" val="Value1" data-cy="radio-1">Value1</q-radio>
  <q-radio v-model="selected" val="Value2" data-cy="radio-2">Value2</q-radio>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'QuasarCheckboxAndToggle',
  setup() {
    const checked = ref();
    const toggled = ref();
    const selected = ref();

    return {
      checked,
      toggled,
      selected,
    };
  },
});
</script>
