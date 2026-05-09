<!-- components/StepsMobile.vue -->
<template>
  <section class="px-4 py-6">
    <h2 class="text-lg font-semibold mb-4">
      Як це працює
    </h2>

    <div class="flex flex-col gap-3">
      <UButton
        v-for="(step, i) in steps"
        :key="i"
        variant="outline"
        color="primary"
        block
        class="justify-start text-left py-4"
      >
        <div>
          <p class="font-medium">
            {{ i + 1 }}. {{ step.title }}
          </p>
          <p class="text-sm text-gray-400">
            {{ step.desc }}
          </p>
        </div>
      </UButton>
    </div>
  </section>
</template>

<script setup>
const steps = [
  { title: 'Залишаєте заявку', desc: 'Напишіть або подзвоніть' },
  { title: 'Уточнення деталей', desc: 'Я звʼяжусь з вами' },
  { title: 'Виконання роботи', desc: 'Швидко і безпечно' },
  { title: 'Готово', desc: 'Смартфон працює ідеально' }
]
</script>