<script setup lang="ts">
import type { Product } from '~/types'

defineProps<{
  product: Product
}>()
</script>

<template>
  <div>
    <div class="block lg:hidden">
      <ProductCardMobile :product="product" />
    </div>

    <div class="hidden lg:block">
      <ProductCardDesktop :product="product" />
    </div>
  </div>
</template>