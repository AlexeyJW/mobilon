<!-- components/ContactMobile.vue -->
<template>
  <section id="contact-form" class="px-4 py-6">
    <UCard>
      <h3 class="text-lg font-semibold mb-4 text-center">
        Залиште заявку
      </h3>

      <UForm
  :form="form"
  class="space-y-3"
  @submit.prevent="submitForm"
>
  <UInput
    v-model="form.name"
    placeholder="Ваше ім'я"
  />

  <UInput
    v-model="form.phone"
    placeholder="Телефон"
  />

  <UTextarea
    v-model="form.description"
    placeholder="Опис"
  />

  <UButton
    block
    size="lg"
    :loading="loading"
    :disabled="loading"
    type="submit"
  >
    {{ loading ? 'Відправка...' : 'Надіслати' }}
  </UButton>
</UForm>
    </UCard>
  </section>
</template>

<script setup>
const route = useRoute()
const form = reactive({
  name: '',
  phone: '',
  description: route.query.service
    ? `Послуга: ${route.query.service}`
    : ''
})

const loading = ref(false)
const toast=useToast()
function showToast() {
  toast.add({
    title: 'Заявка збережена',
    description: 'Ваша заявка успішно збережена. Ми зв\'яжемося з вами найближчим часом.',
    color: 'success'
  })
}
async function submitForm() {
  loading.value = true

  try {
    const response = await $fetch('/api/request', {
      method: 'POST',
      body: form
    })

    console.log(response)

    // alert('Заявка збережена')
    showToast()
    form.name = ''
    form.phone = ''
    form.description = ''
  } catch (error) {
    console.error(error)
   console.error('Full error:', error)
    
    // Отримуємо деталі помилки
    const errorMessage = error.data?.statusMessage || error.message || 'Невідома помилка'
    console.error('Error message:', errorMessage)
    
    // Показуємо конкретну помилку
    alert(`Помилка: ${errorMessage}`)
  
    
  }

  loading.value = false
}
</script>