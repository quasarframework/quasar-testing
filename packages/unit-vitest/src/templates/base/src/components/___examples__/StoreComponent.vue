<template>
  <div>
    {{ counter }}
    <q-btn @click="store.increment"> Increment </q-btn>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useCounterStore } from './example-store';

const store = useCounterStore();

const counter = computed(() => store.counter);
</script>
