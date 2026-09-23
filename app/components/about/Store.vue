<template>
  <RevealOnScroll>
    <section class="space-y-8">

      <!-- Заголовок -->
      <div class="text-center space-y-3">
        <UBadge
          color="primary"
          variant="soft"
        >
          Mobilon
        </UBadge>

        <h2
          class="
            text-3xl
            md:text-4xl
            font-bold
            text-default
          "
        >
          Що знайдете в Mobilon
        </h2>

        <p
          class="
            text-muted
            max-w-2xl
            mx-auto
            leading-relaxed
          "
        >
          Смартфони, аксесуари та необхідні послуги —
          усе, щоб обрати, захистити й налаштувати
          ваш пристрій.
        </p>
      </div>

      <!-- Картки -->
      <div
        class="
          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-4
          gap-4
        "
      >

        <!-- Смартфони -->
        <UCard
          class="
            group
            bg-elevated
            border-border
            transition-all
            duration-300
            hover:-translate-y-1
            hover:shadow-lg
            hover:border-primary/30
          "
        >
          <div class="space-y-4">

            <div
              class="
                w-12
                h-12
                rounded-xl
                bg-primary/10
                flex
                items-center
                justify-center
                text-primary
              "
            >
              <UIcon
                name="i-lucide-smartphone"
                class="size-6"
              />
            </div>

            <div>
              <h3 class="text-lg font-bold text-default">
                Смартфони
              </h3>

              <p class="mt-2 text-sm text-muted leading-relaxed">
                Актуальні моделі смартфонів різних брендів
                і цінових категорій.
              </p>
            </div>

          </div>
        </UCard>

        <!-- Аксесуари -->
        <UCard
          class="
            group
            bg-elevated
            border-border
            transition-all
            duration-300
            hover:-translate-y-1
            hover:shadow-lg
            hover:border-primary/30
          "
        >
          <div class="space-y-4">

            <div
              class="
                w-12
                h-12
                rounded-xl
                bg-primary/10
                flex
                items-center
                justify-center
                text-primary
              "
            >
              <UIcon
                name="i-lucide-headphones"
                class="size-6"
              />
            </div>

            <div>
              <h3 class="text-lg font-bold text-default">
                Аксесуари
              </h3>

              <p class="mt-2 text-sm text-muted leading-relaxed">
                Чохли, зарядні пристрої, кабелі,
                навушники та інші аксесуари.
              </p>
            </div>

          </div>
        </UCard>

        <!-- Захист -->
        <UCard
          class="
            group
            bg-elevated
            border-border
            transition-all
            duration-300
            hover:-translate-y-1
            hover:shadow-lg
            hover:border-primary/30
          "
        >
          <div class="space-y-4">

            <div
              class="
                w-12
                h-12
                rounded-xl
                bg-primary/10
                flex
                items-center
                justify-center
                text-primary
              "
            >
              <UIcon
                name="i-lucide-shield-check"
                class="size-6"
              />
            </div>

            <div>
              <h3 class="text-lg font-bold text-default">
                Захист смартфона
              </h3>

              <p class="mt-2 text-sm text-muted leading-relaxed">
                Захисне скло та плівки з установленням
                безпосередньо в магазині.
              </p>
            </div>

          </div>
        </UCard>

        <!-- Сервіс -->
        <UCard
          class="
            group
            bg-elevated
            border-border
            transition-all
            duration-300
            hover:-translate-y-1
            hover:shadow-lg
            hover:border-primary/30
          "
        >
          <div class="space-y-4">

            <div
              class="
                w-12
                h-12
                rounded-xl
                bg-primary/10
                flex
                items-center
                justify-center
                text-primary
              "
            >
              <UIcon
                name="i-lucide-wrench"
                class="size-6"
              />
            </div>

            <div>
              <h3 class="text-lg font-bold text-default">
                Допомога та сервіс
              </h3>

              <p class="mt-2 text-sm text-muted leading-relaxed">
                Налаштування смартфонів, перенесення даних
                та приймання техніки в ремонт.
              </p>
            </div>

          </div>
        </UCard>

      </div>

      <!-- Посилання -->
      <div class="flex justify-center">
        <UButton
          to="/catalog"
          size="lg"
          color="primary"
          variant="soft"
          trailing-icon="i-lucide-arrow-right"
        >
          Переглянути каталог
        </UButton>
      </div>

    </section>
  </RevealOnScroll>
</template>