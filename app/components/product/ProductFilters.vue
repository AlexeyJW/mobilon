<script setup lang="ts">
const model = defineModel<string>()
</script>

<template>
  <UInput
    v-model="model"
    icon="i-lucide-search"
    placeholder="Пошук товару..."
    size="xl"
  />
</template> 