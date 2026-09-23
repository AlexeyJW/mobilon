<script setup lang="ts">
const mobi = useMobi()

function openMobiPicker() {
  mobi.startProductSelection()
}
</script>

<template>
  <RevealOnScroll>
    <section>
      <UCard
        class="
          overflow-hidden
          bg-gradient-to-br
          from-primary/20
          to-cyan-500/10
          border-primary/20
        "
      >
        <div
          class="
            py-6
            md:py-10
            px-2
            text-center
            max-w-3xl
            mx-auto
          "
        >
          <div
            class="
              w-14
              h-14
              mx-auto
              rounded-2xl
              bg-primary/10
              flex
              items-center
              justify-center
              text-primary
            "
          >
            <UIcon
              name="i-lucide-store"
              class="size-7"
            />
          </div>

          <h2
            class="
              mt-5
              text-3xl
              md:text-4xl
              font-bold
              text-default
            "
          >
            Завітайте до Mobilon
          </h2>

          <p
            class="
              mt-4
              text-muted
              leading-relaxed
              max-w-2xl
              mx-auto
            "
          >
            Перегляньте смартфони та аксесуари в нашому
            каталозі або попросіть Мобі допомогти
            підібрати смартфон під ваш бюджет.
          </p>

          <div
            class="
              mt-7
              flex
              flex-col
              sm:flex-row
              justify-center
              gap-3
            "
          >
            <UButton
              to="/catalog"
              size="lg"
              color="primary"
              trailing-icon="i-lucide-arrow-right"
            >
              Переглянути каталог
            </UButton>

            <UButton
              size="lg"
              color="primary"
              variant="outline"
              icon="i-lucide-sparkles"
              @click="openMobiPicker"
            >
              Підібрати з Мобі
            </UButton>
          </div>
        </div>
      </UCard>
    </section>
  </RevealOnScroll>
</template>