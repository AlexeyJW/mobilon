<script setup lang="ts">
import type { Product } from '~/types'

defineProps<{
  product: Product
}>()
</script>

<template>
  <div class="grid lg:grid-cols-2 gap-12">

    <ProductGallery
      :product="product"
    />

    <ProductInfo
  :product="product"
/>

  </div>
</template>