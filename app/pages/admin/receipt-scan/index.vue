<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const toast = useToast()

const scanning = ref(false)
const scannerStarted = ref(false)
const decodedText = ref('')
const resolving = ref(false)

let html5QrCode: any = null

async function startScanner() {
  if (scanning.value) return

  decodedText.value = ''

  try {
    // Спочатку показуємо контейнер сканера
    scannerStarted.value = true

    // Чекаємо, поки Vue створить
    // #receipt-qr-reader у DOM
    await nextTick()

    const { Html5Qrcode } = await import('html5-qrcode')

    html5QrCode = new Html5Qrcode('receipt-qr-reader')

    scanning.value = true

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
      async (text: string) => {
        if (resolving.value) return

        resolving.value = true
        decodedText.value = text

        await stopScanner()

        toast.add({
          title: 'QR-код прочитано',
          description: 'Дані чека отримано',
          color: 'success'
        })

        resolving.value = false
      },
      () => {
        // Помилки окремих кадрів ігноруємо
      }
    )
  } catch (error: any) {
    scanning.value = false

    console.error('CAMERA ERROR:', error)

    toast.add({
      title: 'Не вдалося запустити камеру',
      description:
        error?.message ||
        String(error) ||
        'Невідома помилка камери',
      color: 'error'
    })
  }
}

async function stopScanner() {
  if (!html5QrCode) {
    scanning.value = false
    return
  }

  try {
    if (scanning.value) {
      await html5QrCode.stop()
    }

    await html5QrCode.clear()
  } catch {
    // нічого
  }

  html5QrCode = null
  scanning.value = false
}

function scanAgain() {
  decodedText.value = ''
  startScanner()
}

onBeforeUnmount(async () => {
  await stopScanner()
})
</script>

<template>
  <section class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold">
        Сканування фіскального чека
      </h1>

      <p class="text-muted mt-1">
        Відскануйте QR-код з фіскального чека
      </p>
    </div>

    <UCard>
      <div class="space-y-5">

        <div
          v-if="!scannerStarted && !decodedText"
          class="py-8 text-center"
        >
          <UIcon
            name="i-lucide-receipt-text"
            class="size-12 mx-auto mb-4 text-primary"
          />

          <p class="text-muted mb-5">
            Наведіть камеру на QR-код чека.
          </p>

          <UButton
            icon="i-lucide-camera"
            size="lg"
            @click="startScanner"
          >
            Сканувати чек
          </UButton>
        </div>

        <div
          v-if="scannerStarted && !decodedText"
          class="space-y-4"
        >
          <div
            id="receipt-qr-reader"
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
              v-else
              icon="i-lucide-camera"
              @click="startScanner"
            >
              Запустити камеру
            </UButton>
          </div>
        </div>

        <div
          v-if="decodedText"
          class="space-y-4"
        >
          <UAlert
            color="success"
            variant="soft"
            icon="i-lucide-circle-check"
            title="QR-код чека прочитано"
          />

          <div>
            <p class="text-sm font-medium mb-2">
              Вміст QR:
            </p>

            <div
              class="p-4 rounded-xl bg-elevated break-all text-sm"
            >
              {{ decodedText }}
            </div>
          </div>

          <UButton
            icon="i-lucide-scan-line"
            @click="scanAgain"
          >
            Сканувати інший чек
          </UButton>
        </div>

      </div>
    </UCard>
  </section>
</template>