<template>
  <q-btn color="primary" data-testid="button">
    Button
    <q-tooltip data-testid="tooltip" class="bg-red" :offset="[10, 10]">
      Here I am!
    </q-tooltip>
  </q-btn>
</template>
