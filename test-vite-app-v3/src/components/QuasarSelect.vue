<template>
  <q-select
    v-model="selected"
    data-cy="select"
    label="test options selection"
    :options="options"
    :loading="loading"
    :disable="disable"
    :multiple="multiple"
  />

  <span data-cy="select-value">{{ selected }}</span>
</template>

<script setup lang="ts">
import { ref } from "vue";

const syncOptions = ["Option 1", "Option 2", "Option 3"];

const {
  loadOptionsAsync = false,
  disable = false,
  multiple = false
} = defineProps<{
  loadOptionsAsync?: boolean;
  disable?: boolean;
  multiple?: boolean;
}>();

const selected = ref();
const loading = ref(false);

const options = ref();

if (loadOptionsAsync) {
  loading.value = true;
  setTimeout(() => {
    options.value = syncOptions;
    loading.value = false;
  }, 2000);
} else {
  options.value = syncOptions;
}
</script>
