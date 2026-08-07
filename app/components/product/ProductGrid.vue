<script setup lang="ts">
import type { Product } from '~/types'

defineProps<{
  products: Product[]
}>()
</script>

<template>
  <div class="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
    <!-- <ProductListCard
      v-for="product in products"
      :key="product.id"
      :product="product"
    /> -->
    <ProductCard
      v-for="product in products"
      :key="product.id"
      :product="product"
    />
  </div>
</template>