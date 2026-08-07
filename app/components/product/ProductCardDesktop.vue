<script setup lang="ts">
import type { Product } from '~/types'

defineProps<{
  product: Product
}>()
</script>

<template>
  <NuxtLink
    :to="`/products/${product.slug}`"
    class="group block"
  >
    <UCard>

<div class="flex justify-between">

    <ProductBadges :product="product"/>

    <ProductAvailability :product="product"/>

</div>

<div class="flex mt-5 gap-8">

  <!-- Фото -->

 <div class="relative flex items-center justify-center w-44 h-44">

  <!-- Біла підкладка -->
  <div
    class="
      absolute
      inset-0
      m-auto
      w-[138px]
      h-[138px]
      bg-white
      rounded-xl
    "
  />

  <!-- Телефон -->
  <img
    :src="product.imageUrl"
    :alt="product.name"
    class="
      relative
      w-[128px]
      h-[128px]
      object-contain
      z-10
      transition
      duration-300
      group-hover:scale-105
    "
  />

</div>

  <!-- Контент -->

  <div class="flex flex-col flex-1">

    <h2 class="text-2xl font-bold">
      {{ product.name }}
    </h2>

    <div class="text-primary font-medium mt-1">
      {{ product.brand }}
    </div>

    <p class="mt-4 text-gray-500 line-clamp-4">
      {{ product.shortDescription }}
    </p>

  </div>

</div>

<div class="mt-auto border-t pt-6 flex justify-between">

    <ProductPrice :product="product"/>

    <UButton>
        Детальніше
    </UButton>

</div>

</UCard>
  </NuxtLink>
</template>