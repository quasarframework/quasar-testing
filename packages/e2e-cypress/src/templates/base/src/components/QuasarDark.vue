<template>
  <q-card data-cy="dark-card" :dark="$q.dark.isActive">
    {{ $q.dark.isActive ? 'Dark ' : 'Light' }} content
  </q-card>
</template>
