<template>
  <UCard class="bg-elevated">
    <div class="flex flex-col sm:flex-row gap-4">
      <div class="flex-1">
        <UInput
          :model-value="searchQuery"
          @update:model-value="$emit('update:searchQuery', $event)"
          placeholder="Пошук за назвою або постачальником..."
          icon="i-lucide-search"
          size="lg"
        />
      </div>

      <div class="flex flex-wrap gap-2">
        <USelect
          :model-value="filterSupplier"
          @update:model-value="$emit('update:filterSupplier', $event)"
          :options="supplierOptions"
          class="w-40"
          size="lg"
        />

        <USelect
          :model-value="filterSort"
          @update:model-value="$emit('update:filterSort', $event)"
          :options="sortOptions"
          class="w-40"
          size="lg"
        />

        <UButton
          color="neutral"
          variant="ghost"
          size="lg"
          @click="$emit('reset')"
        >
          <Icon
            name="i-lucide-rotate-ccw"
            class="w-4 h-4"
          />
          Скинути
        </UButton>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineProps({
  searchQuery: String,
  filterSupplier: String,
  filterSort: String,
  supplierOptions: Array,
  sortOptions: Array
})

defineEmits([
  'update:searchQuery',
  'update:filterSupplier',
  'update:filterSort',
  'reset'
])
</script>

<style scoped>

</style>