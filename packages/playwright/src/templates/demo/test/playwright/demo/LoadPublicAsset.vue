<template>
  <img :src="iconSrc" height="200" data-testid="test-image" />
</template>

<script setup<% if (shouldSupportTypeScript) { %> lang="ts"<% } %>>
// Vite does not add the public path to a root-absolute URL inside a component.
const iconSrc = `${import.meta.env.BASE_URL}icons/favicon-16x16.png`;
</script>
