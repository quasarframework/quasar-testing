<template>
  <h3>Quasar Component</h3>
  <q-input v-model="txtName" data-test="txt-name" />
  <div data-test="result">
    {{ txtName }}
  </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  data() {
    return {
      txtName: 'Initial State'
    }
  },
})
</script>
