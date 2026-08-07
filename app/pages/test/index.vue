<script setup lang="ts">
const value = ref('all')

const items = [
  { label: 'Усі', value: 'all' },
  { label: 'Samsung', value: 'Samsung' },
  { label: 'Apple', value: 'Apple' }
]
</script>

<template>
  <div class="p-10">
    <USelect
      v-model="value"
      :items="items"
      class="w-64"
    />
  </div>
</template>