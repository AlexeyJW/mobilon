<script setup lang="ts">
import type { Product } from '~/types'

const { data } = await useFetch<Product[]>('/api/products')

const products = computed(() => data.value ?? [])

const search = ref('')
const brand = ref('all')
const category = ref('all')

const brands = computed(() => {
  return ['all', ...new Set(products.value.map(p => p.brand))]
})

const categories = computed(() => {
  return ['all', ...new Set(products.value.map(p => p.category))]
})

const filteredProducts = computed(() => {
  const q = search.value.trim().toLowerCase()

  return products.value.filter(product => {

    if (
      q &&
      ![
        product.name,
        product.brand,
        product.category
      ]
        .join(' ')
        .toLowerCase()
        .includes(q)
    ) {
      return false
    }

    if (
      brand.value !== 'all' &&
      product.brand !== brand.value
    ) {
      return false
    }

    if (
      category.value !== 'all' &&
      product.category !== category.value
    ) {
      return false
    }

    return true
  })
})
</script>

<template>

<div class="space-y-8">

  <CatalogHero />

  <UInput
    v-model="search"
    icon="i-lucide-search"
    placeholder="Пошук товару..."
    size="lg"
  />

  <CatalogCategoryChips
    v-model="category"
    :categories="categories"
  />

  <CatalogBrandChips
    v-model="brand"
    :brands="brands"
  />

  <ProductGrid
    :products="filteredProducts"
  />

</div>

</template>