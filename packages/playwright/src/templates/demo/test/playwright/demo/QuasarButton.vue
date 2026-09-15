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

<script setup<% if (shouldSupportTypeScript) { %> lang="ts"<% } %>>
<% if (shouldSupportTypeScript) { %>
defineEmits<{ test: [] }>();
<% } else { %>
defineEmits(['test']);
<% } %>
</script>
