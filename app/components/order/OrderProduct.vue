<script setup lang="ts">
import type { Product } from '~/types'

const props = defineProps<{
  product: Product | null
  quantity: number
}>()

const emit = defineEmits<{
  increase: []
  decrease: []
}>()
</script>

<template>
 
  <div
   v-if="props.product !== null"
    class="
      rounded-2xl
      border
      border-default
      bg-default
      p-5
    "
  >
    <div class="flex gap-5">

      <!-- Фото -->

      <div
        class="
          w-24
          h-24
          rounded-xl
          bg-white
          p-2
          flex
          items-center
          justify-center
          shrink-0
        "
      >
        <img
          v-if="props.product?.imageUrl"
          :src="props.product.imageUrl"
          :alt="props.product.name"
          class="w-full h-full object-contain"
        >

        <UIcon
          v-else
          name="i-lucide-image"
          class="text-3xl text-gray-400"
        />
      </div>

      <!-- Інформація -->

      <div class="flex-1">

        <h3 class="font-bold text-lg">
          {{ props.product.name }}
        </h3>

        <div class="text-primary font-semibold mt-1">
          {{ props.product.sellPrice }} грн
        </div>

        <div class="mt-4 flex items-center gap-3">

          <span class="text-sm text-gray-500">
            Кількість
          </span>

      <UButton
  size="xs"
  color="neutral"
  variant="soft"
  @click="emit('decrease')"
>
  -
</UButton>

<span class="w-6 text-center font-bold">
  {{ props.quantity }}
</span>

<UButton
  size="xs"
  color="neutral"
  variant="soft"
  @click="emit('increase')"
>
  +
</UButton>

        </div>

      </div>

    </div>

  </div>
</template>