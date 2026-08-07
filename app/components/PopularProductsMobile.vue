<script setup lang="ts">
const { data: products } = await useFetch('/api/products/popular')
</script>

<template>
  <ProductSection
    badge="Популярні товари"
    title="Найчастіше купують"
    description="Телефони та аксесуари, які користуються найбільшим попитом"
  >

    <ProductGrid
      :products="products ?? []"
    />

  </ProductSection>

  <div class="mt-8">
    <UButton
      block
      size="lg"
      color="primary"
      variant="outline"
      to="/products"
    >
      Переглянути більше товарів
    </UButton>
  </div>
</template>