<script setup>
const form = reactive({
  login: '',
  password: ''
})

const loading = ref(false)

async function login() {
  loading.value = true

  try {
    await $fetch('/api/login', {
      method: 'POST',
      body: form,
      credentials: 'include'
    })
    console.log('LOGIN SUCCESS')
    await navigateTo('/admin/requests')
  } catch (error) {
    alert('Невірний логін або пароль')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="min-h-screen flex items-center justify-center p-4">
    <UCard class="w-full max-w-md">
      <h1 class="text-2xl font-bold mb-6 text-center">
        Вхід в адмінку
      </h1>

      <div class="space-y-4">
        <UInput
          v-model="form.login"
          placeholder="Логін"
        />

        <UInput
          v-model="form.password"
          type="password"
          placeholder="Пароль"
        />

        <UButton
          block
          :loading="loading"
          @click="login"
        >
          Увійти
        </UButton>
      </div>
    </UCard>
  </section>
</template>