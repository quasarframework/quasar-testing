import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'MyDialog',
  setup() {
    const isDialogOpen = ref(false);
    return { isDialogOpen };
  },
});
