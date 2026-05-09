<!-- components/ContactMobile.vue -->
<template>
  <section class="px-4 py-6">
    <UCard>
      <h3 class="text-lg font-semibold mb-4 text-center">
        Залиште заявку
      </h3>

      <UForm :form="form" class="space-y-3" @submit.prevent="submitForm"> 
        <UInput v-model="form.name" placeholder="Ваше ім'я" />
        <UInput v-model="form.phone" placeholder="Телефон" />
        <UTextarea v-model="form.description" placeholder="Опис" />
        <UButton block size="lg" :disabled="loading" type="submit">
          Надіслати
        </UButton>
      </UForm>
    </UCard>
  </section>
</template>

<script setup>
const form = reactive({
  name: '',
  phone: '',
  description: ''
})

const loading = ref(false)

async function submitForm() {
  loading.value = true

  try {
    const response = await $fetch('/api/request', {
      method: 'POST',
      body: form
    })

    console.log(response)

    alert('Заявка збережена')

    form.name = ''
    form.phone = ''
    form.description = ''
  } catch (error) {
    console.error(error)

    alert('Помилка')
  }

  loading.value = false
}
</script>