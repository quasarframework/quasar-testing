<script setup lang="ts">
import QuasarPageSticky from "./QuasarPageSticky.vue";
</script>

<template>
  <!-- QPageSticky needs a QLayout and a QPage ancestor -->
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page>
        <QuasarPageSticky title="Test" />
      </q-page>
    </q-page-container>
  </q-layout>
</template>
