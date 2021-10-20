<template>
  <q-page-sticky position="bottom-right" :offset="[18, 18]">
    <q-btn rounded color="accent" icon="arrow_forward" class="rotate-45">
      {{ title }}
    </q-btn>
  </q-page-sticky>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'QuasarPageSticky',
  props: {
    title: String,
  },
});
</script>
