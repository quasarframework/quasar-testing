import { defineComponent, ref } from "vue";
import VModelComponent from "./VModelComponent.vue";

// v-model from a story: the story holds the ref and records it for the test
export const Default = defineComponent(() => {
  const model = ref("Quasar");

  return () => (
    <>
      <VModelComponent
        modelValue={model.value}
        onUpdate:modelValue={(value: string) => {
          model.value = value;
        }}
      />
      <form hidden>
        <input data-testid="recorded-model" readonly value={model.value} />
      </form>
    </>
  );
});
