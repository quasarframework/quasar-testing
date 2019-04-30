<template>
<q-layout>
  <q-page-container>
    <q-page>
      <p class="textContent">{{ input }}</p>
      <span>{{ counter }}</span>
      <q-btn id="mybutton" @click="increment()"></q-btn>
    </q-page>
  </q-page-container>
</q-layout>
</template>

<script>

export default {
  name: 'QBUTTON',
  data () {
    return {
      counter: 0,
      input: 'rocket muffin'
    }
  },
  methods: {
    increment () {
      this.counter++
    }
  }
}
</script>
