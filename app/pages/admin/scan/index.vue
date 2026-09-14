<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const router = useRouter()
const toast = useToast()

const scannerStarted = ref(false)
const scanning = ref(false)
const resolving = ref(false)

let html5QrCode: any = null

async function startScanner() {
  if (scanning.value) {
    return
  }

  try {
    scanning.value = true
    scannerStarted.value = true

    const { Html5Qrcode } = await import('html5-qrcode')

    html5QrCode = new Html5Qrcode('qr-reader')

    await html5QrCode.start(
      {
        facingMode: 'environment'
      },
      {
        fps: 10,
        qrbox: {
          width: 250,
          height: 250
        }
      },
      async (decodedText: string) => {
        await handleQr(decodedText)
      },
      () => {
        // Помилки читання кадру ігноруємо
      }
    )
  } catch (error) {
    scanning.value = false

    toast.add({
      title: 'Не вдалося запустити камеру',
      description:
        'Перевір дозвіл браузера на використання камери.',
      color: 'error'
    })
  }
}

async function stopScanner() {
  if (!html5QrCode) {
    return
  }

  try {
    await html5QrCode.stop()
    await html5QrCode.clear()
  } catch {
    // нічого
  }

  html5QrCode = null
  scanning.value = false
}

function extractToken(value: string) {
  const trimmed = value.trim()

  try {
    const url = new URL(trimmed)

    const parts = url.pathname
      .split('/')
      .filter(Boolean)

    const bonusIndex = parts.indexOf('bonus')

    if (
      bonusIndex !== -1 &&
      parts[bonusIndex + 1]
    ) {
      return parts[bonusIndex + 1]
    }
  } catch {
    // Якщо це не URL,
    // спробуємо використати як token
  }

  return trimmed
}

async function handleQr(decodedText: string) {
  if (resolving.value) {
    return
  }

  resolving.value = true

  try {
    await stopScanner()

    const token = extractToken(decodedText)

    if (!token) {
      throw new Error('TOKEN_NOT_FOUND')
    }

    const result = await $fetch<{
      success: boolean
      customer: {
        id: number
        name: string
      }
    }>(
      `/api/admin/customers/card/${encodeURIComponent(token)}`
    )

    toast.add({
      title: 'Картку знайдено',
      description: result.customer.name,
      color: 'success'
    })

    await router.push(
      `/admin/customers/${result.customer.id}`
    )
  } catch (error: any) {
    resolving.value = false

    toast.add({
      title: 'Картку не знайдено',
      description:
        error?.data?.statusMessage ||
        'QR-код не належить бонусній картці Mobilon.',
      color: 'error'
    })
  }
}

onBeforeUnmount(async () => {
  await stopScanner()
})
</script>

<template>
  <section class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold">
        Сканування бонусної картки
      </h1>

      <p class="text-muted mt-1">
        Відскануйте QR-код клієнта
      </p>
    </div>

    <UCard>
      <div class="space-y-5">
        <div
          v-if="!scannerStarted"
          class="py-8 text-center"
        >
          <UIcon
            name="i-lucide-scan-line"
            class="size-12 mx-auto mb-4 text-primary"
          />

          <p class="text-muted mb-5">
            Для сканування потрібен доступ до камери.
          </p>

          <UButton
            icon="i-lucide-camera"
            size="lg"
            @click="startScanner"
          >
            Сканувати картку
          </UButton>
        </div>

        <div
          v-else
          class="space-y-4"
        >
          <div
            id="qr-reader"
            class="w-full max-w-md mx-auto overflow-hidden rounded-xl"
          />

          <div class="flex justify-center">
            <UButton
              v-if="scanning"
              color="neutral"
              variant="soft"
              icon="i-lucide-square"
              @click="stopScanner"
            >
              Зупинити камеру
            </UButton>

            <UButton
              v-else-if="!resolving"
              icon="i-lucide-camera"
              @click="startScanner"
            >
              Сканувати ще раз
            </UButton>
          </div>
        </div>

        <div
          v-if="resolving"
          class="flex items-center justify-center gap-2 text-muted"
        >
          <UIcon
            name="i-lucide-loader-circle"
            class="size-5 animate-spin"
          />

          Пошук клієнта...
        </div>
      </div>
    </UCard>
  </section>
</template>