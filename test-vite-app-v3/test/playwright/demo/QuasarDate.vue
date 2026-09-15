<template>
  <q-date v-model="date" data-testid="date-picker" />

  <div>
    <q-input v-model="date" label="Choose date">
      <template #append>
        <q-btn
          data-testid="open-date-picker-popup-button"
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

  <span data-testid="date-value">{{ date }}</span>
</template>

<script setup lang="ts">
import type { QDialog } from "quasar";
import { ref, useTemplateRef } from "vue";

const date = ref("");
const dateDialogRef = useTemplateRef<QDialog>("dateDialogRef");
</script>
