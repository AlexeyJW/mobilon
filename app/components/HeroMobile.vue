<!-- components/HeroSection.vue -->
<template>
  <section class="px-4 pt-4 pb-8 text-center">

  <div class="relative flex justify-center mb-4">

  
    <!-- картинка -->
    <NuxtImg
      src="/images/hero1.png"
      width="500"
      height="500"
      class="w-[240px] h-auto"
    />
  </div>
    <!-- BADGE -->
    <UBadge
      color="primary"
      variant="outline"
      class="mb-4"
    >
      Налаштування смартфонів
    </UBadge>

    <!-- TITLE -->
    <h1 class="text-2xl font-bold leading-tight mb-4">
      Ваш смартфон. <br />
      <span class="text-primary">
        Налаштований
      </span> для вас.
    </h1>

    <!-- DESCRIPTION -->
    <p class="text-gray-400 mb-6">
      Перенесення даних, очищення від вірусів,
      оптимізація та налаштування.
    </p>

    <!-- BUTTONS -->
    <div class="flex flex-col gap-3">
      <UButton
        block
        size="lg"
        color="primary"
        class="justify-center"
      >
        Залишити заявку →
      </UButton>

      <UButton
        block
        variant="outline"
        size="lg"
      >
        Дізнатись більше
      </UButton>
    </div>

  </section>
</template>