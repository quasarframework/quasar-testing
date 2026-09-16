<template>
  <q-select
    v-model="selected"
    data-testid="select"
    label="test options selection"
    :options="options"
    :loading="loading"
    :disable="disable"
    :multiple="multiple"
  />

  <span data-testid="select-value">{{ selected }}</span>
</template>

<script setup<% if (shouldSupportTypeScript) { %> lang="ts"<% } %>>
import { ref } from 'vue';

const syncOptions = ['Option 1', 'Option 2', 'Option 3'];

// Long enough that the first click lands before the options exist.
const ASYNC_OPTIONS_DELAY_MS = 500;

<% if (shouldSupportTypeScript) { %>
const {
  loadOptionsAsync = false,
  disable = false,
  multiple = false,
} = defineProps<{
  loadOptionsAsync?: boolean;
  disable?: boolean;
  multiple?: boolean;
}>();
<% } else { %>
const { loadOptionsAsync, disable, multiple } = defineProps({
  loadOptionsAsync: {
    type: Boolean,
    default: false,
  },
  disable: {
    type: Boolean,
    default: false,
  },
  multiple: {
    type: Boolean,
    default: false,
  },
});
<% } %>

const selected = ref();
const loading = ref(false);

const options = ref();

if (loadOptionsAsync) {
  loading.value = true;
  setTimeout(() => {
    options.value = syncOptions;
    loading.value = false;
  }, ASYNC_OPTIONS_DELAY_MS);
} else {
  options.value = syncOptions;
}
</script>
