import { QBtn } from 'quasar';
import { defineComponent, ref } from 'vue';
import QuasarButton from './QuasarButton.vue';

// The story holds the state and writes what the test reads into a hidden form
export const Default = defineComponent(() => {
  const testEmitCount = ref(0);

  return () => (
    <>
      <QuasarButton onTest={() => testEmitCount.value++} />
      <form hidden>
        <input
          data-testid="test-emit-count"
          readonly
          value={String(testEmitCount.value)}
        />
      </form>
    </>
  );
});

// A story with props. The test passes them to mount() and the registry types them.
export const WithLabel = (props<%= ts(': { label: string }') %>) => (
  <QBtn data-testid="button" label={props.label} />
);
