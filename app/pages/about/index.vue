<script setup>
const faqItems = [
  {
    label: 'Чи збережуться мої фото та дані?',
    content: 'Так, ми максимально дбайливо працюємо з даними та погоджуємо всі дії перед виконанням.'
  },
  {
    label: 'Чи можна налаштувати новий телефон?',
    content: 'Так, допомагаємо повністю підготувати новий смартфон до комфортної роботи.'
  },
  {
    label: 'Скільки часу займає налаштування?',
    content: 'Все залежить від задачі, але більшість звернень виконується максимально швидко.'
  },
  {
    label: 'Чи працюєте з Android та iPhone?',
    content: 'Так, допомагаємо з Android-пристроями та iPhone.'
  }
]
</script>

<template>
  <div class="px-4 py-10 space-y-20 bg-default">

    <!-- HERO -->
    <RevealOnScroll>
      <section class="space-y-8">
        <div class="space-y-4">
          <UBadge
            color="primary"
            variant="soft"
            size="lg"
          >
            Про нас
          </UBadge>

          <h1 class="text-4xl font-black leading-tight text-default">
            Mobilon — сервіс
            <span class="text-primary">
              налаштування
            </span>
            та оптимізації смартфонів
          </h1>

          <p class="text-muted text-lg leading-relaxed">
            Допомагаємо перенести дані, налаштувати смартфон,
            очистити систему та підготувати пристрій
            до комфортної роботи.
          </p>
        </div>

        <!-- illustration -->
        <div class="rounded-3xl border border-border bg-elevated backdrop-blur p-6">
          <img
            src="/images/hero.png"
            alt="Mobilon"
            class="w-full"
          >
        </div>
      </section>
    </RevealOnScroll>
    <RevealOnScroll>
  <StoreGallery />
</RevealOnScroll>

    <!-- SERVICES -->
    <RevealOnScroll>
      <section class="space-y-8">
        <div class="text-center space-y-2">
          <h2 class="text-2xl font-bold text-default">
            Що ми робимо
          </h2>
          <div class="w-20 h-1 bg-primary mx-auto rounded-full" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <UCard
            v-for="item in [
              'Перенесення даних',
              'Налаштування Android та iPhone',
              'Очищення системи',
              'Робота з акаунтами',
              'Встановлення програм',
              'Оптимізація смартфона'
            ]"
            :key="item"
            class="bg-elevated border-border shadow-sm hover:bg-elevated/80 transition-colors"
          >
            <div class="space-y-2">
              <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-2xl">
                ⚡
              </div>
              <h3 class="text-lg font-semibold text-default">
                {{ item }}
              </h3>
              <p class="text-muted leading-relaxed">
                Швидко, безпечно та зручно для клієнта.
              </p>
            </div>
          </UCard>
        </div>
      </section>
    </RevealOnScroll>

    <!-- WHY -->
    <RevealOnScroll>
      <section class="space-y-8">
        <div class="text-center space-y-2">
          <h2 class="text-3xl font-bold text-default">
            Чому до нас звертаються
          </h2>
          <div class="w-20 h-1 bg-primary mx-auto rounded-full" />
        </div>

        <div class="space-y-4">
          <div
            v-for="problem in [
              'Повільна робота телефону',
              'Проблеми після оновлень',
              'Нестача пам\'яті',
              'Складне перенесення даних',
              'Проблеми з акаунтами',
              'Складні налаштування'
            ]"
            :key="problem"
            class="flex items-center gap-3 rounded-2xl border border-border bg-elevated backdrop-blur p-4 hover:bg-elevated/80 transition-colors"
          >
            <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              ✓
            </div>
            <p class="text-default">
              {{ problem }}
            </p>
          </div>
        </div>
      </section>
    </RevealOnScroll>

    <!-- STEPS -->
    <RevealOnScroll>
      <section class="space-y-8">
        <div class="text-center space-y-2">
          <h2 class="text-3xl font-bold text-default">
            Як ми працюємо
          </h2>
          <div class="w-20 h-1 bg-primary mx-auto rounded-full" />
        </div>

        <div class="space-y-6">
          <div
            v-for="(step, index) in [
              'Ви залишаєте заявку',
              'Уточнюємо проблему',
              'Виконуємо налаштування',
              'Ви отримуєте результат'
            ]"
            :key="step"
            class="flex gap-4 items-start"
          >
            <div class="min-w-12 h-12 rounded-full bg-primary text-primary-inverted font-bold flex items-center justify-center">
              {{ index + 1 }}
            </div>

            <div>
              <h3 class="text-lg font-semibold text-default">
                {{ step }}
              </h3>
              <p class="text-muted">
                Швидко та зрозуміло для клієнта.
              </p>
            </div>
          </div>
        </div>
      </section>
    </RevealOnScroll>

    <!-- TRUST -->
    <section>
      <UCard class="bg-elevated border-border backdrop-blur">
        <div class="space-y-4">
          <h2 class="text-2xl font-bold text-default">
            Ваша довіра — наш пріоритет
          </h2>
          <p class="text-muted leading-relaxed">
            Ми дбайливо ставимось до особистих даних клієнтів
            та працюємо лише після погодження необхідних дій.
          </p>
          <div class="flex flex-wrap gap-3">
            <UBadge
              color="primary"
              variant="soft"
            >
              Конфіденційність
            </UBadge>
            <UBadge
              color="primary"
              variant="soft"
            >
              Прозорість
            </UBadge>
            <UBadge
              color="primary"
              variant="soft"
            >
              Відповідальність
            </UBadge>
          </div>
        </div>
      </UCard>
    </section>

    <!-- COMMON ISSUES -->
    <section class="space-y-6">
      <h2 class="text-2xl font-bold text-default text-center">
        З чим найчастіше звертаються
      </h2>

      <div class="space-y-3">
        <UCard class="bg-elevated border-border hover:bg-elevated/80 transition-colors">
          <div class="flex items-start gap-3">
            <span class="text-red-400 text-xl">⚠️</span>
            <div>
              <p class="text-default font-medium">Телефон став повільним</p>
              <p class="text-muted text-sm">Система перевантажена або не оптимізована</p>
            </div>
          </div>
        </UCard>

        <UCard class="bg-elevated border-border hover:bg-elevated/80 transition-colors">
          <div class="flex items-start gap-3">
            <span class="text-yellow-400 text-xl">📱</span>
            <div>
              <p class="text-default font-medium">Купили новий смартфон</p>
              <p class="text-muted text-sm">Потрібно перенести всі дані правильно</p>
            </div>
          </div>
        </UCard>

        <UCard class="bg-elevated border-border hover:bg-elevated/80 transition-colors">
          <div class="flex items-start gap-3">
            <span class="text-blue-400 text-xl">🔐</span>
            <div>
              <p class="text-default font-medium">Проблеми з акаунтом</p>
              <p class="text-muted text-sm">Google / iCloud / блокування</p>
            </div>
          </div>
        </UCard>
      </div>
    </section>

    <!-- FAQ -->
    <section class="space-y-8">
      <div class="text-center space-y-2">
        <h2 class="text-3xl font-bold text-default">
          Поширені запитання
        </h2>
        <div class="w-20 h-1 bg-primary mx-auto rounded-full" />
      </div>

      <UAccordion
        :items="faqItems"
        :ui="{
          wrapper: 'space-y-3',
          item: {
            base: 'bg-elevated border border-border rounded-2xl overflow-hidden backdrop-blur hover:bg-elevated/80 transition-colors',
            trigger: 'px-5 py-4 text-left text-default text-[17px] font-medium',
            content: 'px-5 pb-5 text-muted leading-relaxed'
          }
        }"
      />
    </section>

    <!-- CTA -->
    <section id="about-cta">
      <UCard class="bg-gradient-to-br from-primary/20 to-cyan-500/10 border-primary/20 backdrop-blur">
        <div class="space-y-6 text-center">
          <div class="space-y-3">
            <h2 class="text-3xl font-bold text-default">
              Потрібна допомога зі смартфоном?
            </h2>
            <p class="text-muted">
              Залиште заявку і ми допоможемо вам вже сьогодні.
            </p>
          </div>

          <UButton
            to="/#contact-form"
            size="xl"
            block
          >
            Залишити заявку
          </UButton>
        </div>
      </UCard>
    </section>

  </div>
</template>