<script setup lang="ts">
const { data: products } = await useFetch('/api/products/popular')
</script>

<template>
  <ProductSection
    badge="Популярні товари"
    title="Актуальні пропозиції"
    description="Популярні смартфони та техніка, які можна придбати в Mobilon"
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
      to="/catalog"
    >
      Переглянути весь каталог
    </UButton>
  </div>
</template>