<template>
  <p data-testid="boot-url-path">{{ bootUrlPath }}</p>
  <p data-testid="boot-public-path">{{ bootPublicPath }}</p>
  <p data-testid="boot-param-keys">{{ bootParamKeys }}</p>
  <p data-testid="boot-gallery-flag">{{ bootGalleryFlag }}</p>
  <p data-testid="env-testing-flag">{{ envTestingFlag }}</p>
</template>

<script setup lang="ts">
import { inject } from "vue";

const bootUrlPath = inject<string>("galleryBootUrlPath");
const bootPublicPath = inject<string>("galleryBootPublicPath");
const bootParamKeys = inject<string>("galleryBootParamKeys");
const bootGalleryFlag = inject<string>("galleryBootFlag");

const envTestingFlag = String(import.meta.env.QUASAR_TESTING_PLAYWRIGHT);
</script>
