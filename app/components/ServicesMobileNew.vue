<template>
  <section class="px-4 py-10">

    <div class="text-center mb-8">
      <UBadge
        color="primary"
        variant="soft"
        class="mb-3"
      >
        Наші послуги
      </UBadge>

      <h2 class="text-3xl font-bold mb-3">
        Все для вашого смартфона
      </h2>

      <p class="text-muted">
        Продаж телефонів, аксесуарів та професійне обслуговування.
      </p>
    </div>

    <div class="grid gap-5">

      <UCard class="hover:shadow-lg transition">
        <div class="flex gap-4 items-start">

          <div
            class="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl">
            📱
          </div>

          <div>

            <h3 class="font-bold text-lg">
              Смартфони
            </h3>

            <p class="text-muted mt-1">
              Samsung, Xiaomi, Motorola та інші моделі.
            </p>

          </div>

        </div>
      </UCard>

      <UCard class="hover:shadow-lg transition">
        <div class="flex gap-4 items-start">

          <div
            class="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl">
            🎧
          </div>

          <div>

            <h3 class="font-bold text-lg">
              Аксесуари
            </h3>

            <p class="text-muted mt-1">
              Чохли, зарядні пристрої, кабелі, навушники, карти пам'яті та багато іншого.
            </p>

          </div>

        </div>
      </UCard>

      <UCard class="hover:shadow-lg transition">
        <div class="flex gap-4 items-start">

          <div
            class="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl">
            🛡️
          </div>

          <div>

            <h3 class="font-bold text-lg">
              Захисне скло та плівки
            </h3>

            <p class="text-muted mt-1">
              Якісне наклеювання без пилу та бульбашок.
            </p>

          </div>

        </div>
      </UCard>

      <UCard class="hover:shadow-lg transition">
        <div class="flex gap-4 items-start">

          <div
            class="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl">
            ⚙️
          </div>

          <div>

            <h3 class="font-bold text-lg">
              Налаштування та ремонт
            </h3>

            <p class="text-muted mt-1">
              Перенесення даних, встановлення програм, очищення телефону, відновлення акаунтів.
            </p>

          </div>

        </div>
      </UCard>

    </div>

  </section>
</template>