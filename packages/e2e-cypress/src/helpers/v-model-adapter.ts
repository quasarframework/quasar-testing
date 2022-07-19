import { Ref, watch } from 'vue';

// TODO: not properly documented into the README

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
  watch(modelRef, (value) =>
    // TODO: types aren't properly exposed, we should wait until next Cypress release
    // See https://github.com/cypress-io/cypress/issues/22087
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    Cypress.vueWrapper.setProps({ [modelName]: value }),
  );

  return {
    [modelName]: modelRef.value,
    [`onUpdate:${modelName}`]: (emittedValue: T) => {
      modelRef.value = emittedValue;
    },
  };
}
