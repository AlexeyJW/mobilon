<script setup lang="ts">
const model = defineModel<string>({ required: true })

defineProps<{
  brands: string[]
}>()
</script>

<template>

<div class="flex flex-wrap gap-2">

  <UButton
    v-for="item in brands"
    :key="item"
    size="sm"
    :color="model === item ? 'primary' : 'neutral'"
    :variant="model === item ? 'solid' : 'soft'"
    @click="model = item"
  >
    {{ item === 'all' ? 'Усі бренди' : item }}
  </UButton>

</div>

</template>