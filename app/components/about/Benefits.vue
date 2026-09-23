<template>
  <RevealOnScroll>
    <section class="space-y-8">

      <!-- Заголовок -->
      <div class="text-center space-y-3">
        <UBadge
          color="primary"
          variant="soft"
        >
          Чому Mobilon
        </UBadge>

        <h2
          class="
            text-3xl
            md:text-4xl
            font-bold
            text-default
          "
        >
          Більше, ніж просто купити смартфон
        </h2>

        <p
          class="
            text-muted
            max-w-2xl
            mx-auto
            leading-relaxed
          "
        >
          Ми поруч, щоб допомогти з вибором,
          покупкою та першими кроками з новим пристроєм.
        </p>
      </div>

      <!-- Переваги -->
      <div
        class="
          grid
          grid-cols-1
          md:grid-cols-2
          gap-4
        "
      >

        <!-- 1 -->
        <UCard
          class="
            bg-elevated
            border-border
            transition-all
            duration-300
            hover:border-primary/30
            hover:shadow-lg
          "
        >
          <div class="flex gap-4">
            <div
              class="
                shrink-0
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
                name="i-lucide-store"
                class="size-6"
              />
            </div>

            <div>
              <h3 class="text-lg font-bold text-default">
                Можна побачити товар наживо
              </h3>

              <p class="mt-2 text-sm text-muted leading-relaxed">
                Завітайте до магазину, подивіться смартфон,
                потримайте його в руках та порівняйте
                з іншими моделями.
              </p>
            </div>
          </div>
        </UCard>

        <!-- 2 -->
        <UCard
          class="
            bg-elevated
            border-border
            transition-all
            duration-300
            hover:border-primary/30
            hover:shadow-lg
          "
        >
          <div class="flex gap-4">
            <div
              class="
                shrink-0
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
                name="i-lucide-message-circle"
                class="size-6"
              />
            </div>

            <div>
              <h3 class="text-lg font-bold text-default">
                Допоможемо з вибором
              </h3>

              <p class="mt-2 text-sm text-muted leading-relaxed">
                Розкажіть, що для вас важливо і який маєте
                бюджет — допоможемо порівняти варіанти
                та знайти відповідний смартфон.
              </p>
            </div>
          </div>
        </UCard>

        <!-- 3 -->
        <UCard
          class="
            bg-elevated
            border-border
            transition-all
            duration-300
            hover:border-primary/30
            hover:shadow-lg
          "
        >
          <div class="flex gap-4">
            <div
              class="
                shrink-0
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
                name="i-lucide-settings"
                class="size-6"
              />
            </div>

            <div>
              <h3 class="text-lg font-bold text-default">
                Допоможемо після покупки
              </h3>

              <p class="mt-2 text-sm text-muted leading-relaxed">
                За потреби перенесемо дані, допоможемо
                з налаштуванням та підготуємо смартфон
                до використання.
              </p>
            </div>
          </div>
        </UCard>

        <!-- 4 -->
        <UCard
          class="
            bg-elevated
            border-border
            transition-all
            duration-300
            hover:border-primary/30
            hover:shadow-lg
          "
        >
          <div class="flex gap-4">
            <div
              class="
                shrink-0
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
                name="i-lucide-map-pin"
                class="size-6"
              />
            </div>

            <div>
              <h3 class="text-lg font-bold text-default">
                Ми поруч
              </h3>

              <p class="mt-2 text-sm text-muted leading-relaxed">
                Mobilon працює у Солотвині. Якщо після
                покупки виникнуть питання, ви знаєте,
                куди можна звернутися.
              </p>
            </div>
          </div>
        </UCard>

      </div>

    </section>
  </RevealOnScroll>
</template>