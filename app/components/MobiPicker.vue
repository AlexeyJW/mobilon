<script setup lang="ts">
const mobi = useMobi()

function openMobi() {
  mobi.show()
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
          <UButton
            size="lg"
            color="primary"
            trailing-icon="i-lucide-arrow-right"
            class="w-full md:w-auto"
            @click="openMobi"
          >
            Підібрати смартфон з Мобі
          </UButton>
        </div>
      </div>
    </UCard>
  </section>
</template>