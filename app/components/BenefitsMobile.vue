<!-- components/BenefitsMobile.vue -->
<template>
  <section class="px-4 py-6">
    <div class="grid grid-cols-2 gap-4 text-center">
      <UCard v-for="item in items" :key="item.title">
        <div class="flex flex-col items-center gap-2">
          <UIcon :name="item.icon" class="text-primary text-2xl" />
          <p class="font-medium text-sm">{{ item.title }}</p>
        </div>
      </UCard>
    </div>
  </section>
</template>

<script setup>
const items = [
  { title: 'Безпека даних', icon: 'i-heroicons-shield-check' },
  { title: 'Досвід', icon: 'i-heroicons-user' },
  { title: 'Якість', icon: 'i-heroicons-star' },
  { title: 'Підтримка', icon: 'si-glyph:head-set' }
]
</script>