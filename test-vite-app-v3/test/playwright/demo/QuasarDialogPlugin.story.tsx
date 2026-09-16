import { Dialog, QBtn } from "quasar";
import { defineComponent, ref } from "vue";
import QuasarDialogPlugin from "./QuasarDialogPlugin.vue";

const MESSAGE = "Hello, I am a plugin dialog";

// The story holds the state and writes what the test reads into a hidden form
export const Default = defineComponent(() => {
  // Quasar defines Dialog.create when the Dialog plugin is installed. The demo
  // needs "Dialog" in quasar.config > framework > plugins.
  if (typeof Dialog.create !== "function") {
    throw new Error(
      'The QuasarDialogPlugin demo needs the Dialog plugin. Add "Dialog" to framework > plugins in quasar.config.'
    );
  }

  const outcome = ref("");

  function openDialog() {
    Dialog.create({
      component: QuasarDialogPlugin,
      componentProps: { message: MESSAGE }
    })
      .onOk(() => {
        outcome.value = "ok";
      })
      .onCancel(() => {
        outcome.value = "cancel";
      });
  }

  return () => (
    <>
      <QBtn
        data-testid="open-plugin-dialog-button"
        label="Open plugin dialog"
        onClick={openDialog}
      />
      <form hidden>
        <input data-testid="plugin-outcome" readonly value={outcome.value} />
      </form>
    </>
  );
});
