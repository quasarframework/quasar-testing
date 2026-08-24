<script setup<% if (shouldSupportTypeScript) { %> lang="ts"<% } %>>
import { Dialog } from 'quasar';
<% if (shouldSupportTypeScript) { %>
import type { Component } from 'vue';

const { component, componentProps = {} } = defineProps<{
  component: Component;
  componentProps?: Record<string, unknown>;
}>();
<% } else { %>

const { component, componentProps = {} } = defineProps({
  component: {
    type: Object,
    required: true,
  },
  componentProps: {
    type: Object,
    default: () => ({}),
  },
});
<% } %>

Dialog.create({
  component,

  // props forwarded to your custom component
  componentProps,
});
</script>
