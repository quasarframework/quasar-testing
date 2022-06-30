<template>
  <q-checkbox data-cy="checkbox-outside-form" v-model="checked" />
  <q-toggle data-cy="toggle-outside-form" v-model="toggled" />

  <q-form>
    <q-checkbox
      name="checkbox"
      data-cy="checkbox-inside-form"
      v-model="checked"
    />

    <q-toggle name="toggle" data-cy="toggle-inside-form" v-model="toggled" />
  </q-form>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'QuasarCheckboxAndToggle',
  setup() {
    const checked = ref();
    const toggled = ref();

    return {
      checked,
      toggled,
    };
  },
});
</script>
