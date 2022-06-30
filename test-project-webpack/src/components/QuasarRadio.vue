<template>
  <q-radio v-model="checked" val="Value1" data-cy="radio-outside-form-1">
    Value1
  </q-radio>
  <q-radio v-model="checked" val="Value2" data-cy="radio-outside-form-2">
    Value2
  </q-radio>

  <q-form>
    <q-radio
      name="radio"
      v-model="checked"
      val="Value1"
      data-cy="radio-inside-form-1"
    >
      Value1
    </q-radio>
    <q-radio
      name="radio"
      v-model="checked"
      val="Value2"
      data-cy="radio-inside-form-2"
    >
      Value2
    </q-radio>
  </q-form>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'QuasarRadio',
  setup() {
    const checked = ref();

    return {
      checked,
    };
  },
});
</script>
