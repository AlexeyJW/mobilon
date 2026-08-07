<script setup lang="ts">
import type { Product } from '~/types'

defineProps<{
  product: Product
}>()
</script>

<template>
  <UCard
    class="group overflow-hidden rounded-3xl border hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
  >
    <!-- Фото -->
    <div class="relative">

      <NuxtImg
  v-if="product.imageUrl"
  :src="product.imageUrl"
  width="220"
  height="220"
  class="h-44 w-full object-contain bg-white p-4 transition duration-300 group-hover:scale-105"
/>

      <div
        v-else
        class="aspect-square bg-muted flex items-center justify-center text-6xl"
      >
        📦
      </div>

      <!-- Бейджі -->
      <div class="absolute left-3 top-3 flex flex-col gap-2">

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
          v-if="product.isPopular"
          color="warning"
          variant="solid"
        >
          🔥 Хіт
        </UBadge>

      </div>

    </div>

    <!-- Контент -->
    <div class="p-5 space-y-4">

      <div>

        <h3
          class="font-bold text-xl leading-tight line-clamp-2"
        >
          {{ product.name }}
        </h3>

        <p
          class="text-sm text-muted mt-2 min-h-[40px]"
        >
          {{ product.shortDescription }}
        </p>

      </div>

      <!-- Ціна -->
      <div class="flex items-end justify-between">

        <div>

          <p class="text-3xl font-bold text-primary">
            {{ product.sellPrice.toLocaleString('uk-UA') }} грн
          </p>

          <p
            class="text-sm"
            :class="product.quantity > 0 ? 'text-green-600' : 'text-red-500'"
          >
            {{ product.quantity > 0 ? '✔ В наявності' : '❌ Немає в наявності' }}
          </p>

        </div>

      </div>

      <!-- Кнопка -->
      <UButton
        block
        color="primary"
        size="lg"
        variant="soft"
      >
        Детальніше
      </UButton>

    </div>

  </UCard>
</template>