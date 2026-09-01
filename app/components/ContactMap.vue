```vue
<script setup lang="ts">
const latitude = 47.949502
const longitude = 23.879385

const googleMapsUrl =
  `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
</script>

<template>
  <section class="py-12">
    <div class="mx-auto max-w-6xl px-4">
      <div class="mb-6">
        <h2 class="text-2xl font-bold tracking-tight sm:text-3xl">
          Як нас знайти
        </h2>

        <p class="mt-2 text-muted">
          Mobilon — магазин телефонів та аксесуарів
        </p>
      </div>

      <div class="overflow-hidden rounded-2xl border border-default shadow-sm" id="contact_map">
        <iframe
          :src="`https://www.google.com/maps?q=${latitude},${longitude}&z=17&output=embed`"
          width="100%"
          height="400"
          style="border: 0"
          loading="lazy"
          allowfullscreen
          referrerpolicy="no-referrer-when-downgrade"
        />
      </div>

      <div class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="font-medium">
            📍 вул. Залізнична, 3, Солотвино
          </p>

          <p class="mt-1 text-sm text-muted">
            Закарпатська область
          </p>
        </div>

        <UButton
          :to="googleMapsUrl"
          target="_blank"
          icon="i-lucide-navigation"
          size="lg"
        >
          Прокласти маршрут
        </UButton>
      </div>
    </div>
  </section>
</template>
