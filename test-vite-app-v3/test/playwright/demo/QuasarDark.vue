<template>
  <q-card data-testid="dark-card" :dark="$q.dark.isActive">
    {{ $q.dark.isActive ? "Dark" : "Light" }} content
  </q-card>

  <q-btn
    data-testid="toggle-dark-button"
    label="Toggle dark mode"
    @click="$q.dark.toggle()"
  />
</template>
