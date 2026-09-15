import { QSelect } from "quasar";
import { defineComponent, ref } from "vue";
import QuasarSelect from "./QuasarSelect.vue";

export const Default = () => <QuasarSelect />;
export const Disabled = () => <QuasarSelect disable />;
export const AsyncOptions = () => <QuasarSelect loadOptionsAsync />;
export const Multiple = () => <QuasarSelect multiple />;

// Quasar renders a slice of a long list, so reaching a later option needs scrolling
const MANY_OPTIONS = Array.from(
  { length: 200 },
  (_, index) => `Option ${index + 1}`
);

export const LongList = defineComponent(() => {
  const selected = ref<string>();

  return () => (
    <>
      <QSelect
        modelValue={selected.value}
        onUpdate:modelValue={(value: string) => {
          selected.value = value;
        }}
        data-testid="select"
        label="test long option list"
        options={MANY_OPTIONS}
      />
      <span data-testid="select-value">{selected.value}</span>
    </>
  );
});
