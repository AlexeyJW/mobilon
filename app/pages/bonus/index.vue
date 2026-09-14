<script setup lang="ts">
const router = useRouter()

const phone = ref('')
const loading = ref(false)
const errorMessage = ref('')

const savedToken = useCookie<string | null>('mobilon-bonus-token', {
  maxAge: 60 * 60 * 24 * 365,
  sameSite: 'lax'
})

onMounted(() => {
  if (savedToken.value) {
    router.replace(`/bonus/${savedToken.value}`)
  }
})

async function findCard() {
  errorMessage.value = ''

  if (!phone.value.trim()) {
    errorMessage.value = 'Введіть номер телефону'
    return
  }

  loading.value = true

  try {
    const result = await $fetch<{
      success: boolean
      customer: {
        name: string
      }
      cardToken: string
    }>('/api/bonus', {
      method: 'POST',
      body: {
        phone: phone.value
      }
    })

    savedToken.value = result.cardToken

    await router.push(`/bonus/${result.cardToken}`)
  } catch (error: any) {
    errorMessage.value =
      error?.data?.statusMessage ||
      'Не вдалося знайти бонусну картку'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="min-h-screen flex items-center justify-center px-4 py-10">
    <div class="w-full max-w-md">
      <UCard>
        <div class="space-y-6">
          <div class="text-center">
            <div
              class="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4"
            >
              <UIcon
                name="i-lucide-credit-card"
                class="size-7 text-primary"
              />
            </div>

            <h1 class="text-2xl font-bold">
              Бонусна картка Mobilon
            </h1>

            <p class="text-muted mt-2">
              Введіть номер телефону, щоб відкрити свою бонусну картку
            </p>
          </div>

          <UFormField label="Номер телефону">
            <UInput
              v-model="phone"
              type="tel"
              inputmode="tel"
              autocomplete="tel"
              placeholder="098 123 45 67"
              size="lg"
              class="w-full"
              @keyup.enter="findCard"
            />
          </UFormField>

          <UAlert
            v-if="errorMessage"
            color="error"
            variant="soft"
            icon="i-lucide-circle-alert"
            :title="errorMessage"
          />

          <UButton
            block
            size="lg"
            icon="i-lucide-search"
            :loading="loading"
            @click="findCard"
          >
            Відкрити мою картку
          </UButton>

          <p class="text-xs text-muted text-center">
            Після першого входу картка буде запам’ятована на цьому пристрої.
          </p>
        </div>
      </UCard>
    </div>
  </main>
</template>