<template>
    <q-btn
        data-cy="button"
        label="test emit"
        color="positive"
        rounded
        icon="edit"
        @click="$emit('test')"
    ></q-btn>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'QuasarButton',
    emits: ['test']
});
</script>
