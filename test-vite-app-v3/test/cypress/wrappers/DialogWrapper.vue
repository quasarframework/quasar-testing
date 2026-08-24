<script setup lang="ts">
import { Dialog } from "quasar";
import type { Component } from "vue";

const { component, componentProps = {} } = defineProps<{
  component: Component;
  componentProps?: Record<string, unknown>;
}>();

Dialog.create({
  component,

  // props forwarded to your custom component
  componentProps
});
</script>
