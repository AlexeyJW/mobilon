<!-- components/ServicesMobile.vue -->
<template>
  <section class="px-4 py-6">
    <h2 class="text-lg font-semibold mb-4">
      Що я можу для вас зробити
    </h2>

    <div class="flex flex-col gap-3">
      <UCard v-for="service in services" :key="service.title">
        <div class="flex gap-3 items-start">
          <UIcon :name="service.icon" class="text-primary text-xl mt-1" />

          <div>
            <p class="font-medium">{{ service.title }}</p>
            <p class="text-sm text-gray-500">
              {{ service.desc }}
            </p>
          </div>
        </div>
      </UCard>
    </div>
  </section>
</template>

<script setup>
const services = [
  {
    title: 'Перенесення даних',
    desc: 'Контакти, фото, відео між телефонами',
    icon: 'i-heroicons-arrow-path'
  },
  {
    title: 'Очищення від вірусів',
    desc: 'Видалення шкідливих програм',
    icon: 'i-heroicons-shield-exclamation'
  },
  {
    title: 'Оптимізація',
    desc: 'Прискорення роботи смартфона',
    icon: 'i-heroicons-cog-6-tooth'
  },
  {
    title: 'Налаштування додатків',
    desc: 'Пошта, месенджери, акаунти',
    icon: 'i-heroicons-device-phone-mobile'
  }
]
</script>