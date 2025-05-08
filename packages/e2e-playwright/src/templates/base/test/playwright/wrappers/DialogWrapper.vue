<script<% if (shouldSupportTypeScript) { %> lang="ts"<% } %>>
import { Dialog } from 'quasar';
import { defineComponent, nextTick, onMounted } from 'vue';

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
    onMounted(async () => {
      // When rendering a dialog immediately when the component is mounted, we need to wait for the next tick, otherwise it will break the test. Apparently, rendering the dialog immediately
      // interfers with component mount context. This mostly occurs when running individual tests that immediately render a dialog and rarely when running all tests at once.
      // It throws: "Error: page._wrapApiCall: Execution context was destroyed, most likely because of a navigation."
      // This is only needed to make Playwright tests that display the dialog immediately after mounting the component pass.
      // TODO: Let's check again when Playwright component testing becomes stable
      await nextTick();

      Dialog.create({
        component: props.component,

        // props forwarded to your custom component
        componentProps: props.componentProps,
      });
    });
  },
});
</script>


