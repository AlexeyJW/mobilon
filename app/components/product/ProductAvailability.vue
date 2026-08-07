<script setup lang="ts">
import type { Product } from '~/types'

defineProps<{
  product: Product
}>()
</script>

<template>
  <UBadge
    size="sm"
    variant="soft"
    :color="product.quantity > 0 ? 'success' : 'error'"
  >
    {{ product.quantity > 0 ? '🟢 В наявності' : '🔴 Немає в наявності' }}
  </UBadge>
</template>