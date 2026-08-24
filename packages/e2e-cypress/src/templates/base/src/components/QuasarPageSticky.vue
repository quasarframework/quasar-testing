<template>
  <q-page-sticky position="bottom-right" :offset="[18, 18]">
    <q-btn data-cy="button" rounded color="accent" icon="arrow_forward">
      {{ title }}
    </q-btn>
  </q-page-sticky>
</template>

<script setup<% if (shouldSupportTypeScript) { %> lang="ts"<% } %>>
<% if (shouldSupportTypeScript) { %>
defineProps<{ title: string }>();
<% } else { %>
defineProps({
  title: {
    type: String,
    required: true,
  },
});
<% } %>
</script>
