<template>
  <q-btn data-testid="open-dialog-button" label="Open dialog" @click="isOpen = true" />

  <q-dialog v-model="isOpen">
    <q-card>
      <q-card-section>{{ message }}</q-card-section>

      <q-card-actions align="right">
        <q-btn
          data-testid="ok-button"
          color="primary"
          label="OK"
          @click="onOkClick"
        />
        <q-btn v-close-popup color="primary" label="Cancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup<% if (shouldSupportTypeScript) { %> lang="ts"<% } %>>
import { ref } from 'vue';

<% if (shouldSupportTypeScript) { %>
defineProps<{ message: string }>();
const emit = defineEmits<{ ok: [] }>();
<% } else { %>
defineProps({
  message: {
    type: String,
    required: true,
  },
});
const emit = defineEmits(['ok']);
<% } %>

const isOpen = ref(false);

function onOkClick() {
  emit('ok');
  isOpen.value = false;
}
</script>
