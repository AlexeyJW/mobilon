<script setup lang="ts">
import type { Product } from '~/types'

defineProps<{
  product: Product
}>()
</script>

<template>
  <UCard
    class="group relative overflow-hidden rounded-3xl border
           hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
  >

    <!-- Бейджі -->
    <UiProductBadges
      :product="product"
    />

    <!-- Фото -->
    <UiProductImage
      :image-url="product.imageUrl"
      :alt="product.name"
    />

    <div class="mt-6 space-y-4">

      <div>

        <h3
          class="text-lg font-semibold leading-tight line-clamp-2"
        >
          {{ product.name }}
        </h3>

        <p
          class="text-sm text-muted mt-2 h-10 line-clamp-2"
        >
          {{ product.shortDescription || product.brand }}
        </p>

      </div>

      <UiProductPriceTag
        :price="product.sellPrice"
      />

      <UiProductStockBadge
        :quantity="product.quantity"
      />

      <UButton
        block
        variant="outline"
        color="primary"
        trailing-icon="i-lucide-arrow-right"
        :to="`/catalog/${product.id}`"
      >
        Детальніше
      </UButton>

    </div>

  </UCard>
</template>