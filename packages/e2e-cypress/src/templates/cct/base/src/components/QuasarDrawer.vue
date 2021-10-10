<template>
  <q-drawer
    v-model="drawerLeft"
    show-if-above
    :width="200"
    :breakpoint="700"
    elevated
    class="bg-primary text-white"
  >
    <q-scroll-area class="fit">
      <div class="q-pa-sm">
        <div v-for="n in 50" :key="n">Drawer {{ n }} / 50</div>
      </div>
    </q-scroll-area>
  </q-drawer>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'QuasarDrawer',
  setup() {
    return {
      drawerLeft: ref(true),
    };
  },
};
</script>
