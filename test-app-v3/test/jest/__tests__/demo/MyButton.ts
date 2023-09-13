import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'MyButton',
  props: {
    incrementStep: {
      type: Number,
      default: 1,
    },
  },
  setup(props) {
    const counter = ref(0);
    const input = ref('rocket muffin');
    function increment() {
      counter.value += props.incrementStep;
    }

    return { counter, input, increment };
  },
});
