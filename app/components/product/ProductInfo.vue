<script setup lang="ts">
import type { Product } from '~/types'

const { product } = defineProps<{
  product: Product
}>()

const order = useOrder()

watch(order.product, (v) => {
  console.log('CARD', v)
})
</script>

<template>
  <div class="flex flex-col h-full">

    <!-- Назва -->

    <h1
      class="text-4xl font-black leading-tight"
    >
      {{ product.name }}
    </h1>

    <!-- Бренд -->

    <p
      class="mt-2 text-lg font-medium text-primary"
    >
      {{ product.brand }}
    </p>

    <!-- Бейджі -->

    <div class="mt-6">
      <ProductBadges
        :product="product"
      />
    </div>

    <!-- Ціна -->

    <div class="mt-10">
      <ProductPrice
        :product="product"
      />
    </div>

    <!-- Наявність -->

    <div class="mt-6">
      <ProductAvailability
        :product="product"
      />
    </div>

    <!-- Кнопки -->

    <div class="mt-10 flex gap-4">

<UButton
  size="xl"
  icon="i-lucide-shopping-cart"
  @click="order.show(product)"
>
  Замовити
</UButton>

      <UButton
        size="xl"
        color="neutral"
        variant="soft"
        icon="i-lucide-heart"
      />

    </div>

    <!-- Короткий опис -->

    <div
      class="
        mt-10
        rounded-2xl
        bg-default
        border
        border-default
        p-6
      "
    >

      <h3
        class="font-bold text-lg mb-3"
      >
        Короткий опис
      </h3>

      <p
        class="leading-7 text-gray-600"
      >
        {{ product.shortDescription }}
      </p>

    </div>

  </div>
</template>