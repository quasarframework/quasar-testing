<template>
  <div>
    <span data-testid="model-value">{{ modelValue }}</span>
    <button data-testid="button" @click="removeFirstLetter">
      Remove first letter
    </button>
  </div>
</template>

<script setup lang="ts">
const modelValue = defineModel<string>({ required: true });

function removeFirstLetter() {
  modelValue.value = modelValue.value.substring(1);
}
</script>
