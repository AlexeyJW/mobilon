<script setup lang="ts">
import type { Product } from '~/types'

const route = useRoute()

const {
  data: product,
  pending,
  error
} = await useFetch<Product>(
  `/api/products/by-slug/${route.params.slug}`
)

if (error.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Товар не знайдено'
  })
}

useSeoMeta({
  title: () => product.value?.name ?? 'Товар',
  description: () =>
    product.value?.shortDescription ??
    'Інтернет-магазин Mobilon',
  ogTitle: () => product.value?.name ?? 'Mobilon',
  ogDescription: () =>
    product.value?.shortDescription ??
    'Інтернет-магазин Mobilon',
  ogImage: () => product.value?.imageUrl ?? '',
})
</script>

<template>
  <UContainer class="py-10">

    <div v-if="pending" class="py-20">
      <div class="grid gap-8 lg:grid-cols-2">

        <USkeleton class="aspect-square rounded-3xl" />

        <div class="space-y-4">
          <USkeleton class="h-10 w-3/4" />
          <USkeleton class="h-5 w-1/3" />
          <USkeleton class="h-20 w-full" />
          <USkeleton class="h-14 w-1/2" />
          <USkeleton class="h-12 w-full" />
        </div>

      </div>
    </div>

    <template v-else-if="product">

      <ProductDetails
        :product="product"
      />

      <ProductTabs
        :product="product"
      />

      <!-- Тут пізніше -->
      <!--
      <ProductRelated
        :product="product"
      />
      -->

    </template>

    <div
      v-else
      class="py-20 text-center"
    >
      <UIcon
        name="i-lucide-package-x"
        class="text-6xl text-gray-300"
      />

      <h2 class="mt-6 text-2xl font-bold">
        Товар не знайдено
      </h2>

      <p class="mt-2 text-gray-500">
        Можливо, його вже видалено або посилання неправильне.
      </p>

      <UButton
        class="mt-8"
        to="/"
        icon="i-lucide-arrow-left"
      >
        Повернутися до каталогу
      </UButton>

    </div>

  </UContainer>
</template>