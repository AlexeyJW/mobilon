<script setup lang="ts">
const search = ref('')
const { data: products, pending } = await useFetch('/api/products')

</script>

<template>
  <div class="container mx-auto px-4 py-10">
    <ProductFilters
         v-model="search"
    />
    <UiPageHeader
      title="Каталог товарів"
      description="Смартфони та аксесуари, які можна придбати у Mobilon"
    />

    <div
      v-if="pending"
      class="py-20 text-center"
    >
      Завантаження...
    </div>

    <ProductGrid
      v-else
      :products="products ?? []"
    />

  </div>
</template>