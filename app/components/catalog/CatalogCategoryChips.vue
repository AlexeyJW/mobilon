<script setup lang="ts">
const model = defineModel<string>({ required: true })

defineProps<{
  categories: string[]
}>()
</script>

<template>

<div class="flex flex-wrap gap-2">

  <UButton
    v-for="item in categories"
    :key="item"
    size="sm"
    :color="model === item ? 'primary' : 'neutral'"
    :variant="model === item ? 'solid' : 'soft'"
    @click="model = item"
  >
    {{ item === 'all' ? 'Усі категорії' : item }}
  </UButton>

</div>

</template>