<template>
  <q-btn color="primary">
    {{ $t('success') }}
    <q-tooltip v-model="showTooltip" class="bg-red" :offset="[10, 10]">
      Here I am!
    </q-tooltip>
  </q-btn>
</template>

<script>
import { ref, defineComponent } from 'vue';

export default defineComponent({
  name: 'QuasarTooltip',
  setup() {
    const showTooltip = ref(true);

    return {
      showTooltip,
    };
  },
});
</script>
