<script setup lang="ts">
const mobi = useMobi()

function openMobiPicker() {
  mobi.startProductSelection()
}
</script>

<template>
  <section class="mt-10">
    <UCard
      class="
        overflow-hidden
        rounded-2xl
        border border-primary/20
      "
    >
      <div
        class="
          flex
          flex-col
          md:flex-row
          md:items-center
          md:justify-between
          gap-6
        "
      >
        <!-- Текст -->
        <div class="flex-1">
          <div
            class="
              inline-flex
              items-center
              gap-2
              text-sm
              font-semibold
              text-primary
              mb-3
            "
          >
            <UIcon
              name="i-lucide-sparkles"
              class="text-lg"
            />

            Мобі допоможе
          </div>

          <h2
            class="
              text-2xl
              md:text-3xl
              font-bold
              tracking-tight
            "
          >
            Не знаєте, який смартфон обрати?
          </h2>

          <p
            class="
              mt-3
              text-gray-500
              max-w-2xl
            "
          >
            Напишіть свій бюджет — Мобі допоможе підібрати
            відповідні смартфони з каталогу Mobilon.
          </p>
        </div>

        <!-- Кнопка -->
<div class="shrink-0">
  <div class="mobi-picker-button relative overflow-hidden rounded-lg">
    <UButton
      size="lg"
      color="primary"
      trailing-icon="i-lucide-arrow-right"
      class="w-full md:w-auto"
      @click="openMobiPicker"
    >
      <UIcon
        name="i-lucide-sparkles"
        class="size-5"
      />

      Підібрати смартфон з Мобі
    </UButton>

    <!-- Світлова хвиля -->
    <span class="mobi-shine" />

    <!-- Зірочка -->
    <span class="mobi-sparkle">
      ✨
    </span>
  </div>
</div>
      </div>
    </UCard>
  </section>
</template>

<style scoped>
.mobi-picker-button {
  position: relative;
}

/* Світлова хвиля */
.mobi-shine {
  position: absolute;
  top: -50%;
  left: -60%;
  width: 35%;
  height: 200%;

  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.65),
    transparent
  );

  transform: rotate(20deg);
  pointer-events: none;

  animation: mobi-shine-animation 60s ease-in-out infinite;
}

/* Маленька зірочка */
.mobi-sparkle {
  position: absolute;
  top: -6px;
  right: -5px;

  font-size: 18px;
  opacity: 0;
  pointer-events: none;

  animation: mobi-sparkle-animation 60s ease-in-out infinite;
}

@keyframes mobi-shine-animation {
  0% {
    left: -60%;
    opacity: 0;
  }

  0.3% {
    opacity: 1;
  }

  2% {
    left: 125%;
    opacity: 1;
  }

  2.3% {
    opacity: 0;
  }

  100% {
    left: 125%;
    opacity: 0;
  }
}

@keyframes mobi-sparkle-animation {
  0%,
  0.3% {
    opacity: 0;
    transform: scale(0.5) rotate(0deg);
  }

  0.8% {
    opacity: 1;
    transform: scale(1.25) rotate(15deg);
  }

  1.5% {
    opacity: 1;
    transform: scale(1) rotate(-10deg);
  }

  2.3%,
  100% {
    opacity: 0;
    transform: scale(0.5) rotate(20deg);
  }
}

/* Не анімуємо для користувачів,
   які вимкнули анімації в системі */
@media (prefers-reduced-motion: reduce) {
  .mobi-shine,
  .mobi-sparkle {
    animation: none;
  }
}
</style>