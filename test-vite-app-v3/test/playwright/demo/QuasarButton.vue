<template>
  <q-btn
    data-testid="button"
    label="test emit"
    color="positive"
    rounded
    icon="edit"
    @click="$emit('test')"
  />
</template>

<script setup lang="ts">
defineEmits<{ test: [] }>();
</script>
