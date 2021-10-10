<script>
import { defineComponent } from 'vue';
import { useQuasar } from 'quasar';

export default defineComponent({
  props: {
    component: {
      type: Object,
      required: true,
    },
    componentProps: {
      type: Object,
    },
  },
  setup(props) {
    const $q = useQuasar();

    $q.dialog({
      component: props.component,

      // props forwarded to your custom component
      componentProps: props.componentProps,
    });
  },
});
</script>
