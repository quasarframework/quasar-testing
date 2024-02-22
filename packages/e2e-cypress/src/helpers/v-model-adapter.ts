import { Ref, watch } from 'vue';

// VTU won't accept reactive v-model binding, this adapter manually
// set the model prop each time a new value is emitted
// See https://github.com/vuejs/test-utils/discussions/279

// See https://github.com/vuejs/test-utils/issues/871
export function vModelAdapter<T>(
  modelRef: Ref<T>,
  modelName = 'modelValue',
  // Without this, TS will start complaining as it cannot understand the dynamic type of
  // the returned object and match it with the component props this helper is applied to.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  watch(
    modelRef,
    async (value) => await Cypress.vueWrapper.setProps({ [modelName]: value }),
  );

  return {
    [modelName]: modelRef.value,
    [`onUpdate:${modelName}`]: (emittedValue: T) => {
      modelRef.value = emittedValue;
    },
  };
}
