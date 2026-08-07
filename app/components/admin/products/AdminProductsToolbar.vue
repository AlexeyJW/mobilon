<script setup lang="ts">
const search = defineModel<string>('search')
const category = defineModel<string>('category')
const status = defineModel<any>('status')

defineProps<{
  categoryOptions: any[]
  statusOptions: any[]
}>()

const emit = defineEmits<{
  create: []
}>()
</script>

<template>
  <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

    <div class="grid gap-3 md:grid-cols-3 flex-1">

      <UInput
        v-model="search"
        icon="i-lucide-search"
        placeholder="Пошук товарів..."
      />

     <USelect
  v-model="category"
  :items="['A', 'B', 'C']"
/>

      <USelect
        v-model="status"
        :items="statusOptions"
        placeholder="Статус"
      />

    </div>

    <UButton
      icon="i-lucide-plus"
      @click="emit('create')"
    >
      Новий товар
    </UButton>

  </div>
</template>