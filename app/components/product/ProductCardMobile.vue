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
    <UCard
      class="
        overflow-hidden
        rounded-2xl
        border border-transparent
        transition-all duration-300
        hover:-translate-y-1
        hover:shadow-xl
        hover:border-primary/20
      "
    >
      <!-- Бейджі + наявність -->
      <div class="flex items-start justify-between gap-3">
        <ProductBadges :product="product" />

        <div class="shrink-0">
          <ProductAvailability :product="product" />
        </div>
      </div>

      <!-- Назва -->
      <h3
        class="
          mt-3
          font-bold
          text-base
          leading-tight
          line-clamp-2
        "
      >
        {{ product.name }}
      </h3>

      <!-- Фото + опис -->
      <div class="mt-4 flex gap-4">
        <div
          class="
            w-24
            h-24
            rounded-xl
            overflow-hidden
            bg-white
            shrink-0
            flex
            items-center
            justify-center
          "
        >
          <img
            v-if="product.imageUrl"
            :src="product.imageUrl"
            :alt="product.name"
            class="
              w-full
              h-full
              object-contain
              transition
              duration-500
              group-hover:scale-105
            "
          >

          <div
            v-else
            class="w-full h-full flex items-center justify-center bg-gray-100"
          >
            <UIcon
              name="i-lucide-image"
              class="text-3xl text-gray-400"
            />
          </div>
        </div>

        <div class="flex-1 min-w-0">
          <p
            class="
              text-sm
              text-gray-500
              line-clamp-4
            "
          >
            {{ product.shortDescription }}
          </p>
        </div>
      </div>

      <!-- Ціна + кнопка -->
      <div class="mt-5 border-t pt-4">
        <div class="text-center">
          <div
            class="
              text-3xl
              font-extrabold
              tracking-tight
              text-primary
            "
          >
            {{ product.sellPrice }} грн
          </div>
        </div>

        <UButton
          block
          size="lg"
          color="primary"
          variant="soft"
          trailing-icon="i-lucide-arrow-right"
          class="mt-4"
        >
          Детальніше
        </UButton>
      </div>
    </UCard>
  </NuxtLink>
</template>