<script setup lang="ts">
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

<template>
  <div style="max-width: 500px; margin: 40px auto;">
    <form @submit.prevent="submitForm">
      <input
        v-model="form.name"
        placeholder="Ім'я"
        style="width: 100%; margin-bottom: 10px;"
      />

      <input
        v-model="form.phone"
        placeholder="Телефон"
        style="width: 100%; margin-bottom: 10px;"
      />

      <textarea
        v-model="form.description"
        placeholder="Опис проблеми"
        style="width: 100%; margin-bottom: 10px;"
      />

      <button :disabled="loading">
        Відправити
      </button>
    </form>
  </div>
</template>