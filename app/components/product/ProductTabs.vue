<script setup lang="ts">
import type { Product } from '~/types'

defineProps<{
  product: Product
}>()

const tab = ref('description')
</script>

<template>
  <div class="mt-12">

    <div class="border-b">

      <div class="flex gap-8">

        <button
          class="pb-4 font-semibold transition"
          :class="tab==='description'
            ? 'border-b-2 border-primary text-primary'
            : 'text-gray-500 hover:text-black'"
          @click="tab='description'"
        >
          Опис
        </button>

        <button
          class="pb-4 font-semibold transition"
          :class="tab==='specs'
            ? 'border-b-2 border-primary text-primary'
            : 'text-gray-500 hover:text-black'"
          @click="tab='specs'"
        >
          Характеристики
        </button>

        <button
          class="pb-4 font-semibold transition"
          :class="tab==='reviews'
            ? 'border-b-2 border-primary text-primary'
            : 'text-gray-500 hover:text-black'"
          @click="tab='reviews'"
        >
          Відгуки
        </button>

      </div>

    </div>

    <div class="py-8">

      <div v-if="tab==='description'">

        <p class="leading-8 whitespace-pre-line">
          {{ product.description || 'Опис поки що відсутній.' }}
        </p>

      </div>

      <div
        v-if="tab==='specs'"
        class="grid gap-4 max-w-xl"
      >

        <div class="flex justify-between border-b pb-2">
          <span class="text-gray-500">Бренд</span>
          <span>{{ product.brand }}</span>
        </div>

        <div class="flex justify-between border-b pb-2">
          <span class="text-gray-500">Категорія</span>
          <span>{{ product.category }}</span>
        </div>

        <div class="flex justify-between border-b pb-2">
          <span class="text-gray-500">Код</span>
          <span>{{ product.slug }}</span>
        </div>

      </div>

      <div
        v-if="tab==='reviews'"
        class="text-gray-500"
      >
        Поки що відгуків немає.
      </div>

    </div>

  </div>
</template>