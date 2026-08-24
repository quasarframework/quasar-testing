<template>
  <div>
    <span data-cy="model-value">{{ modelValue }}</span>
    <button
      data-cy="button"
      @click="modelValue = modelValue.length > 0 ? modelValue.substring(1) : ''"
    >
      Remove first letter
    </button>
  </div>
</template>

<script setup<% if (shouldSupportTypeScript) { %> lang="ts"<% } %>>
<% if (shouldSupportTypeScript) { %>
const modelValue = defineModel<string>({ required: true });
<% } else { %>
const modelValue = defineModel({ type: String, required: true });
<% } %>
</script>
