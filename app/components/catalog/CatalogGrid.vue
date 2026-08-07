<script setup lang="ts">
const { data: products } = await useFetch('/api/products')
</script>

<template>

<section class="px-4">

  <div
    class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
  >

    <ProductListCard
  v-for="product in products"
  :key="product.id"
  :product="product"
/>

  </div>

</section>

</template>