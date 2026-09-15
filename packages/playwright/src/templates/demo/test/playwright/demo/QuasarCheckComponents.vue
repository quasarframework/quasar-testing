<template>
  <q-checkbox v-model="checked" data-testid="checkbox" />
  <q-toggle v-model="toggled" data-testid="toggle" />

  <q-radio v-model="selected" val="Value1" data-testid="radio-1">Value1</q-radio>
  <q-radio v-model="selected" val="Value2" data-testid="radio-2">Value2</q-radio>
</template>

<script setup<% if (shouldSupportTypeScript) { %> lang="ts"<% } %>>
import { ref } from 'vue';

const checked = ref();
const toggled = ref();
const selected = ref();
</script>
