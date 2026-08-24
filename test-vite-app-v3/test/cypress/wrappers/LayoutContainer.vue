<template>
  <q-layout>
    <component :is="component" v-bind="$attrs" />
  </q-layout>
</template>

<script setup lang="ts">
import type { Component } from "vue";

defineOptions({ inheritAttrs: false });

defineProps<{ component: Component }>();
</script>
