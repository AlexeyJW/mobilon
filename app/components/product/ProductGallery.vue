<script setup lang="ts">
import type { Product } from '~/types'

defineProps<{
  product: Product
}>()
</script>

<template>
  <div
    class="
      rounded-3xl
      border
      border-default
      bg-default
      p-8
      flex
      items-center
      justify-center
      h-[520px]
    "
  >
    <div
      class="
        bg-white
        rounded-2xl
        p-[8px]
        shadow-sm
      "
    >
      <img
        v-if="product.imageUrl"
        :src="product.imageUrl"
        :alt="product.name"
        class="
          w-[360px]
          h-[360px]
          object-contain
        "
      >

      <div
        v-else
        class="
          w-[360px]
          h-[360px]
          flex
          items-center
          justify-center
        "
      >
        <UIcon
          name="i-lucide-image"
          class="text-7xl text-gray-400"
        />
      </div>
    </div>
  </div>
</template>