import { Dialog, QBtn } from "quasar";
import { defineComponent, ref } from "vue";
import QuasarDialogPlugin from "./QuasarDialogPlugin.vue";

const MESSAGE = "Hello, I am a plugin dialog";

// The story holds the state and writes what the test reads into a hidden form
export const Default = defineComponent(() => {
  const outcome = ref("");

  function openDialog() {
    Dialog.create({
      component: QuasarDialogPlugin,
      componentProps: { message: MESSAGE }
    })
      .onOk(() => (outcome.value = "ok"))
      .onCancel(() => (outcome.value = "cancel"));
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
