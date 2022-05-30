<script>
import { defineComponent } from 'vue';
import { Dialog } from 'quasar';

export default defineComponent({
  name: 'DialogWrapper',
  props: {
    component: {
      type: Object,
      required: true,
    },
    componentProps: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props) {
    Dialog.create({
      component: props.component,

      // props forwarded to your custom component
      componentProps: props.componentProps,
    });
  },
});
</script>
