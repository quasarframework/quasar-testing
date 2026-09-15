<script setup<% if (shouldSupportTypeScript) { %> lang="ts"<% } %>>
import { ref } from 'vue';

const isOuterOpen = ref(false);
const isInnerOpen = ref(false);
</script>

<template>
  <q-btn
    data-testid="open-outer-button"
    label="Open outer"
    @click="isOuterOpen = true"
  />

  <q-dialog v-model="isOuterOpen" data-testid="outer-dialog">
    <q-card>
      <q-card-section>Outer dialog</q-card-section>
      <q-btn
        data-testid="open-inner-button"
        label="Open inner"
        @click="isInnerOpen = true"
      />
    </q-card>
  </q-dialog>

  <q-dialog v-model="isInnerOpen" data-testid="inner-dialog">
    <q-card>
      <q-card-section>Inner dialog</q-card-section>
    </q-card>
  </q-dialog>
</template>
