<script setup lang="ts">
import type { Product } from '~/types'

defineProps<{
  product: Product
}>()
</script>

<template>
  <div class="flex flex-col">
    <span class="text-sm text-gray-500">
      Ціна
    </span>

    <div class="leading-none">
      <span
        class="text-5xl font-black tracking-tight text-primary"
      >
        {{ product.sellPrice }}
      </span>

      <span
        class="ml-2 text-xl font-semibold text-primary"
      >
        грн
      </span>
    </div>
  </div>
</template>