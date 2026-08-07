<script setup lang="ts">
import type { Product } from '~/types'

defineProps<{
  product: Product
}>()
</script>

<template>
  <div class="flex gap-2 flex-wrap">

    <UBadge
      v-if="product.isPopular"
      color="warning"
      variant="solid"
    >
      🔥 TOP
    </UBadge>

    <UBadge
      v-if="product.isNew"
      color="primary"
      variant="solid"
    >
      🆕 NEW
    </UBadge>

    <UBadge
      v-if="product.isSale"
      color="error"
      variant="solid"
    >
      💥 SALE
    </UBadge>

    <UBadge
      v-if="product.isFeatured"
      color="success"
      variant="solid"
    >
      ⭐ Рекомендуємо
    </UBadge>

  </div>
</template>