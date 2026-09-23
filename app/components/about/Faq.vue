<script setup lang="ts">
const faqItems = [
  {
    label: 'Чи можна подивитися смартфон перед покупкою?',
    content:
      'Так. Ви можете завітати до магазину Mobilon у Солотвині, подивитися доступні моделі та порівняти їх перед покупкою.'
  },
  {
    label: 'Чи допоможете підібрати смартфон?',
    content:
      'Так. Розкажіть, який у вас бюджет і що для вас важливо у смартфоні — допоможемо порівняти відповідні варіанти.'
  },
  {
    label: 'Чи можна одразу підібрати чохол і захисне скло?',
    content:
      'Так. Допоможемо підібрати сумісні аксесуари, а захисне скло або плівку можемо встановити в магазині.'
  },
  {
    label: 'Чи допомагаєте налаштувати новий смартфон?',
    content:
      'Так. За потреби допоможемо з початковим налаштуванням, перенесенням контактів, фото та інших даних зі старого смартфона.'
  }
]
</script>

<template>
  <RevealOnScroll>
    <section class="space-y-8">

      <div class="text-center space-y-3">
        <UBadge
          color="primary"
          variant="soft"
        >
          FAQ
        </UBadge>

        <h2
          class="
            text-3xl
            md:text-4xl
            font-bold
            text-default
          "
        >
          Поширені запитання
        </h2>

        <p
          class="
            text-muted
            max-w-2xl
            mx-auto
          "
        >
          Коротко відповідаємо на запитання
          про покупки та послуги Mobilon.
        </p>
      </div>

      <div class="max-w-3xl mx-auto">
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
      </div>

    </section>
  </RevealOnScroll>
</template>