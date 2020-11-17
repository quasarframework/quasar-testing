import Vue from 'vue';

export default Vue.extend({
  // <= MUST extend Vue instance
  name: 'QBUTTON',
  data: function (): { counter: number; input: string } {
    // <= data MUST have a return type or TS won't be able to correctly infer its content on `this` context later on
    return {
      counter: 0,
      input: 'rocket muffin',
    };
  },
  methods: {
    increment(): void {
      // <= methods return type MUST be annotated too
      this.counter++;
    },
  },
});
