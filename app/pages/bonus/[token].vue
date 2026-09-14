<script setup lang="ts">
import QRCode from 'qrcode'

const route = useRoute()

interface BonusCardResponse {
  success: boolean
  customer: {
    name: string
    bonusBalance: number
  }
}

const token = computed(() =>
  String(route.params.token ?? '')
)

const {
  data,
  pending,
  error
} = await useFetch<BonusCardResponse>(
  () => `/api/bonus/${token.value}`
)

const customer = computed(() => {
  return data.value?.customer ?? null
})

const qrCode = ref('')

onMounted(async () => {
  if (!token.value) {
    return
  }

  try {
    const cardUrl =
      `${window.location.origin}/bonus/${token.value}`

    qrCode.value = await QRCode.toDataURL(
      cardUrl,
      {
        width: 300,
        margin: 2
      }
    )
  } catch (error) {
    console.error(
      'Помилка генерації QR:',
      error
    )
  }
})
</script>

<template>
  <div
    class="min-h-screen bg-default flex items-center justify-center p-4"
  >
    <div class="w-full max-w-md">
      <UCard>
        <div
          v-if="pending"
          class="py-10 text-center"
        >
          <UIcon
            name="i-lucide-loader-circle"
            class="size-8 animate-spin mx-auto mb-3"
          />

          <p class="text-muted">
            Завантаження бонусної картки...
          </p>
        </div>

        <div
          v-else-if="error"
          class="py-10 text-center"
        >
          <UIcon
            name="i-lucide-circle-x"
            class="size-10 mx-auto mb-3 text-error"
          />

          <h1 class="text-xl font-semibold mb-2">
            Картку не знайдено
          </h1>

          <p class="text-muted">
            Бонусна картка недійсна або була деактивована.
          </p>
        </div>

        <div
          v-else-if="customer"
          class="space-y-6"
        >
          <div class="text-center">
            <div class="text-2xl font-bold">
              Mobilon
            </div>

            <div class="text-sm text-muted mt-1">
              Бонусна картка
            </div>
          </div>

          <div class="text-center">
            <div class="text-lg font-medium">
              {{ customer.name }}
            </div>
          </div>

          <div
            class="rounded-xl bg-elevated p-6 text-center"
          >
            <div class="text-sm text-muted mb-2">
              Ваш бонусний баланс
            </div>

            <div class="text-4xl font-bold">
              {{ customer.bonusBalance }}
            </div>

            <div class="text-sm text-muted mt-1">
              бонусів
            </div>
          </div>

          <div
            v-if="qrCode"
            class="flex flex-col items-center gap-3"
          >
            <img
              :src="qrCode"
              alt="QR-код бонусної картки"
              class="w-56 h-56 rounded-xl"
            >

            <p class="text-sm text-muted text-center">
              Покажіть цей QR-код продавцю
            </p>
          </div>

          <div class="flex justify-center">
            <UBadge
              color="success"
              variant="soft"
              size="lg"
            >
              Картка активна
            </UBadge>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>