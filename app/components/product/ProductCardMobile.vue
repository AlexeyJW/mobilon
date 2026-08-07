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
      <!-- Назва -->
      <div class="flex items-start justify-between gap-3">

        <h3
          class="font-bold text-base leading-tight line-clamp-2 flex-1"
        >
          {{ product.name }}
        </h3>

        <UBadge
          size="xs"
          variant="soft"
          :color="product.quantity > 0 ? 'success' : 'error'"
        >
          {{ product.quantity > 0 ? 'Є' : 'Немає' }}
        </UBadge>

      </div>

      <!-- Фото + опис -->
      <div class="mt-4 flex gap-4">

        <div
          class="
            w-24
            h-24
            rounded-xl
            overflow-hidden
            bg-gray-100
            shrink-0
          "
        >
          <img
            v-if="product.imageUrl"
            :src="product.imageUrl"
            :alt="product.name"
            class="
              w-full
              h-full
              object-cover
              transition
              duration-500
              group-hover:scale-105
            "
          >

          <div
            v-else
            class="w-full h-full flex items-center justify-center"
          >
            <UIcon
              name="i-lucide-image"
              class="text-3xl text-gray-400"
            />
          </div>

        </div>

        <div class="flex flex-col justify-between flex-1">

          <p
            class="text-sm text-gray-500 line-clamp-4"
          >
            {{ product.shortDescription }}
          </p>

        </div>

      </div>

      <!-- Низ -->
      <div class="mt-5 border-t pt-4">

        <div
          class="text-center"
        >
          <div
            class="text-3xl font-extrabold tracking-tight text-primary"
          >
            {{ product.sellPrice }} грн
          </div>

          <div
            class="text-xs text-gray-400 mt-1"
          >
            {{ product.quantity }} шт.
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