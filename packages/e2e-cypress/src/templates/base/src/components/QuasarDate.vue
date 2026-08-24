<template>
  <q-date v-model="date" data-cy="date-picker" />

  <div>
    <q-input v-model="date" label="Choose date">
      <template #append>
        <q-btn
          data-cy="open-date-picker-popup-button"
          icon="event"
          flat
          round
          @click="dateDialogRef?.show()"
        />
      </template>
    </q-input>
    <q-dialog ref="dateDialogRef">
      <q-date v-model="date" @update:model-value="dateDialogRef?.hide()" />
    </q-dialog>
  </div>

  <span data-cy="date-value">{{ date }}</span>
</template>

<script setup<% if (shouldSupportTypeScript) { %> lang="ts"<% } %>>
<% if (shouldSupportTypeScript) { %>
import type { QDialog } from 'quasar';
<% } %>
import { ref, useTemplateRef } from 'vue';

const date = ref('');
const dateDialogRef = useTemplateRef<% if (shouldSupportTypeScript) { %><QDialog><% } %>('dateDialogRef');
</script>
