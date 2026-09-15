<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card>
      <q-card-section data-testid="plugin-dialog-message">{{
        message
      }}</q-card-section>

      <q-card-actions align="right">
        <q-btn
          data-testid="plugin-ok-button"
          color="primary"
          label="OK"
          @click="onDialogOK"
        />
        <q-btn
          data-testid="plugin-cancel-button"
          color="primary"
          label="Cancel"
          @click="onDialogCancel"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from "quasar";

defineProps<{ message: string }>();

defineEmits([...useDialogPluginComponent.emits]);

// Dialog.create() mounts this component itself, so a test reaches it only
// through the plugin. That is what this demo covers.
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();
</script>
