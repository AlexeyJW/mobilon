<template>
  <section class="px-4 py-12">

    <div class="text-center mb-8">

      <UBadge
        color="primary"
        variant="soft"
        class="mb-3"
      >
        Популярні бренди
      </UBadge>

      <h2 class="text-3xl font-bold">
        У нас ви знайдете
      </h2>

      <p class="text-muted mt-2">
        Смартфони та аксесуари від перевірених виробників
      </p>

    </div>

    <div class="grid grid-cols-2 gap-4">

      <UCard
        v-for="brand in brands"
        :key="brand.name"
        class="group text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
      >

        <div
          class="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center text-4xl mb-4 group-hover:scale-110 transition"
        >
          {{ brand.icon }}
        </div>

        <h3 class="font-bold text-lg">
          {{ brand.name }}
        </h3>

        <p class="text-sm text-muted mt-2">
          {{ brand.description }}
        </p>

      </UCard>

    </div>

  </section>
</template>

<script setup>

const brands = [

  {
    name: 'Samsung',
    icon: '📱',
    description: 'Galaxy A, S, FE'
  },

  {
    name: 'Xiaomi',
    icon: '📲',
    description: 'Redmi • Poco'
  },

  {
    name: 'Motorola',
    icon: '🤖',
    description: 'Moto G • Edge'
  },

  {
    name: 'Apple',
    icon: '🍎',
    description: 'iPhone'
  },

  {
    name: 'Аксесуари',
    icon: '🎧',
    description: 'Чохли • Кабелі'
  },

  {
    name: 'Захист',
    icon: '🛡️',
    description: 'Скло • Плівки'
  }

]

</script>