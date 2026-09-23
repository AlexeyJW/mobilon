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
      🔥 Популярний
    </UBadge>

    <UBadge
      v-if="product.isNew"
      color="primary"
      variant="solid"
    >
      🆕 Новинка
    </UBadge>

    <UBadge
      v-if="product.isSale"
      color="error"
      variant="solid"
    >
      💥 Акція
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