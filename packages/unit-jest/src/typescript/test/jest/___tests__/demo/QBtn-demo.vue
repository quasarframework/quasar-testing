<script lang="ts" src="./QBtn-demo.ts"></script>

<template>
  <div>
    <p class="textContent">{{ input }}</p>
    <span>{{ counter }}</span>
    <q-btn id="mybutton" @click="increment()"></q-btn>
  </div>
</template>
