<template>
  <q-btn @click="onClick"> Click me! </q-btn>
</template>

<script setup>
import { useQuasar } from 'quasar';

const $q = useQuasar();

function onClick() {
  $q.notify('Hello there!');
}
</script>
