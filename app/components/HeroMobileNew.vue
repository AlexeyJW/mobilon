<!-- components/HeroMobile.vue -->
<template>
  <section class="px-4 pt-6 pb-10">

    <div class="max-w-3xl mx-auto">

      <!-- Картинка -->
      <div class="flex justify-center mb-6">
        <NuxtImg
          src="/images/hero1.png"
          width="500"
          height="500"
          class="w-[250px] h-auto"
          alt="Mobilon - магазин смартфонів та сервіс"
        />
      </div>

      <!-- Badge -->
       
      <div class="flex flex-wrap justify-center gap-2">
        <UBadge
          color="primary"
          variant="soft"
          size="lg"
          @click="() => $router.push('/#contact_map')"
        >
          📍 Солотвино
        </UBadge>
       
       <a
          href="tel:+380984455233"
          class="inline-flex"
        >
          <UBadge
            color="primary"
            variant="soft"
            size="lg"
            class="cursor-pointer"
          >
            📞 +38 (098) 445-52-33
          </UBadge>
        </a>

      </div>
       
      <!-- Заголовок -->
      <h1 class="mt-6 text-center text-4xl font-black leading-tight">
        Магазин смартфонів
        <span class="text-primary">
          та сервісний центр
        </span>
        у Солотвині
      </h1>

      <!-- Опис -->
      <p class="mt-5 text-center text-lg text-muted leading-relaxed">
        Продаж смартфонів
        <strong>Samsung</strong>,
        <strong>Xiaomi</strong>,
        <strong>Motorola</strong>,
        аксесуарів, поклейка захисного скла,
        ремонт та налаштування телефонів.
      </p>

      <!-- Переваги -->
      <div class="mt-8 grid grid-cols-2 gap-3">

        <div class="rounded-xl bg-elevated border border-border p-3 text-center">
          📱<br>
          <span class="font-medium">
            Смартфони
          </span>
        </div>

        <div class="rounded-xl bg-elevated border border-border p-3 text-center">
          🛠<br>
          <span class="font-medium">
            Ремонт
          </span>
        </div>

        <div class="rounded-xl bg-elevated border border-border p-3 text-center">
          🛡<br>
          <span class="font-medium">
            Захисне скло
          </span>
        </div>

        <div class="rounded-xl bg-elevated border border-border p-3 text-center">
          🎧<br>
          <span class="font-medium">
            Аксесуари
          </span>
        </div>

      </div>

      <!-- Кнопки -->
      <div class="mt-8 flex flex-col gap-3">

        <UButton
          href="#contact-form"
          size="xl"
          block
          color="primary"
        >
          Отримати консультацію
        </UButton>

        <UButton
          to="/about"
          size="xl"
          block
          variant="outline"
        >
          Детальніше про Mobilon
        </UButton>

      </div>

    </div>

  </section>
</template>