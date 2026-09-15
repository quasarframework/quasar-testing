import { QSelect } from "quasar";
import { defineComponent, ref } from "vue";
import QuasarMenu from "./QuasarMenu.vue";

export const Default = () => <QuasarMenu />;

// A QSelect popup is a QMenu too. quasar.menu() has to skip it. The button
// comes first so the open select popup does not cover it.
export const WithSelect = defineComponent(() => {
  const selected = ref<string>();

  return () => (
    <>
      <QuasarMenu />
      <QSelect
        modelValue={selected.value}
        onUpdate:modelValue={(value: string) => {
          selected.value = value;
        }}
        data-testid="select"
        label="test options selection"
        options={["A", "B"]}
      />
    </>
  );
});
