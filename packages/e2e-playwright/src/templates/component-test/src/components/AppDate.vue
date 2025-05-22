<template>
  <q-date v-model="date" data-testid="date-picker" />

  <div>
    <q-input v-model="date" label="Date" data-testid="selected-date-input">
      <template #append>
        <q-btn
          data-testid="open-date-picker-popup-button"
          icon="event"
          flat
          round
          @click="dateDialogRef.show()"
        />
      </template>
    </q-input>
    <q-dialog ref="dateDialogRef">
      <q-date v-model="date" data-testid="date-proxy" @update:model-value="dateDialogRef.hide()" />
    </q-dialog>
  </div>
</template>

<script<% if (shouldSupportTypeScript) { %> lang="ts"<% } %>>
<% if (shouldSupportTypeScript) { %>import type { QDialog } from 'quasar';
import type { Ref } from 'vue';<% } %>
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'QuasarDate',
  setup() {
    const date = ref('');
    const dateDialogRef = ref()<% if (shouldSupportTypeScript) { %> as Ref<QDialog><% } %>;

    return {
      date,
      dateDialogRef,
    };
  },
});
</script>
