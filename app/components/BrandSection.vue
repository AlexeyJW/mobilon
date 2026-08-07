<template>
  <section class="px-4 py-14">

    <div class="max-w-6xl mx-auto">

      <div class="text-center mb-10">

        <UBadge
          color="primary"
          variant="soft"
          class="mb-3"
        >
          Смартфони
        </UBadge>

        <h2 class="text-3xl font-bold mb-3">
          Продаємо популярні бренди
        </h2>

        <p class="text-muted max-w-2xl mx-auto">
          Допоможемо вибрати смартфон під ваш бюджет,
          перенесемо всі дані та повністю налаштуємо його.
        </p>

      </div>

      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">

        <UCard
          v-for="brand in brands"
          :key="brand.title"
          class="hover:shadow-xl transition-all hover:-translate-y-1"
        >

          <div class="flex flex-col items-center text-center gap-4">

            <div
              class="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-4xl"
            >
              {{ brand.icon }}
            </div>

            <div>

              <h3 class="font-bold text-lg">
                {{ brand.title }}
              </h3>

              <p class="text-sm text-muted mt-2">
                {{ brand.text }}
              </p>

            </div>

          </div>

        </UCard>

      </div>

      <div class="text-center mt-10">

        <UButton
          size="xl"
          color="primary"
          href="#contact-form"
        >
          Підібрати смартфон
        </UButton>

      </div>

    </div>

  </section>
</template>

<script setup>

const brands = [

{
title:'Samsung',
icon:'📱',
text:'Galaxy A, Galaxy S, Galaxy FE'
},

{
title:'Xiaomi',
icon:'⚡',
text:'Redmi, Poco, Xiaomi'
},

{
title:'Motorola',
icon:'🚀',
text:'Moto G, Edge'
},

{
title:'Nokia',
icon:'☎️',
text:'Кнопкові та Android'
}

]

</script>