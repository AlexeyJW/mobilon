
<script setup lang="ts">
import QRCode from 'qrcode'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const priceUrl = 'https://mobilon.com.ua/price'

const canvas = ref<HTMLCanvasElement | null>(null)
const generating = ref(true)

async function generateQr() {
  if (!canvas.value) return

  generating.value = true

  try {
    const container = canvas.value.parentElement

    if (!container) return

    const size = Math.min(
      container.clientWidth,
      360
    )

    await QRCode.toCanvas(
      canvas.value,
      priceUrl,
      {
        width: size,
        margin: 3,
        errorCorrectionLevel: 'H'
      }
    )
  } catch (error) {
    console.error('QR generation error:', error)
  } finally {
    generating.value = false
  }
}

function handleResize() {
  generateQr()
}

onMounted(() => {
  generateQr()

  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})

function downloadQr() {
  if (!canvas.value) return

  const link = document.createElement('a')

  link.download = 'mobilon-price-qr.png'
  link.href = canvas.value.toDataURL('image/png')

  link.click()
}

function printQr() {
  if (!canvas.value) return

  const image = canvas.value.toDataURL('image/png')

  const printWindow = window.open('', '_blank')

  if (!printWindow) {
    alert('Дозвольте відкривати нові вікна для друку')
    return
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="uk">
      <head>
        <meta charset="UTF-8">
        <title>Mobilon — QR прайс</title>

        <style>
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: Arial, sans-serif;
            background: white;
            color: #111;
          }

          .poster {
            width: 500px;
            padding: 40px;
            text-align: center;
          }

          .logo {
            font-size: 42px;
            font-weight: 900;
            margin-bottom: 8px;
          }

          .subtitle {
            font-size: 15px;
            color: #666;
            margin-bottom: 30px;
          }

          .title {
            font-size: 28px;
            font-weight: 800;
            margin-bottom: 25px;
          }

          .qr {
            width: 380px;
            height: 380px;
            display: block;
            margin: 0 auto 25px;
          }

          .scan {
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 10px;
          }

          .url {
            font-size: 14px;
            color: #666;
          }

          @media print {
            body {
              min-height: auto;
            }
          }
        </style>
      </head>

      <body>
        <div class="poster">

          <div class="logo">
            Mobilon
          </div>

          <div class="subtitle">
            сучасні мобільні технології
          </div>

          <div class="title">
            ПРАЙС НА ПОСЛУГИ
          </div>

          <img
            class="qr"
            src="${image}"
            alt="QR-код Mobilon"
          >

          <div class="scan">
            Відскануйте QR-код
          </div>

          <div class="url">
            mobilon.com.ua/price
          </div>

        </div>
      </body>
    </html>
  `)

  printWindow.document.close()

  printWindow.focus()

  setTimeout(() => {
    printWindow.print()
  }, 300)
}

onMounted(() => {
  generateQr()
})
</script>

<template>
  <div class="mx-auto max-w-5xl space-y-6">

    <!-- Header -->

    <div>
      <h1 class="text-2xl font-bold text-default">
        QR-код прайсу
      </h1>

      <p class="mt-1 text-sm text-muted">
        QR-код для розміщення на фасаді магазину
      </p>
    </div>

    <!-- Main -->

    <div class="grid gap-6 lg:grid-cols-[1fr_360px]">

      <!-- Preview -->

      <UCard>

        <template #header>

          <div>
            <h2 class="font-bold text-default">
              Попередній перегляд
            </h2>

            <p class="mt-1 text-sm text-muted">
              Людина після сканування потрапить
              безпосередньо на сторінку прайсу.
            </p>
          </div>

        </template>

        <div
          class="flex min-h-[600px] items-center justify-center rounded-2xl bg-white p-8"
        >

          <div class="text-center">

            <LogoMobilon3
              size="lg"
              :darkText="true"
            />

            <!-- Title -->

            <div
              class="mt-8 text-2xl font-black text-black"
            >
              ПРАЙС НА ПОСЛУГИ
            </div>

            <!-- QR -->

            <div
              class="mt-6 flex justify-center"
            >

            <div class="w-full max-w-[360px] mx-auto rounded-2xl bg-white p-3 sm:p-4 shadow-sm">
              <canvas
                ref="canvas"
                class="block w-full h-auto"
              />
            </div>

            </div>

            <!-- Text -->

            <div
              class="mt-6 text-lg font-bold text-black"
            >
              Відскануйте QR-код
            </div>

            <div
              class="mt-2 text-sm text-gray-500"
            >
              щоб переглянути актуальний прайс
            </div>

            <div
              class="mt-3 text-xs text-gray-400"
            >
              mobilon.com.ua/price
            </div>

          </div>

        </div>

      </UCard>

      <!-- Controls -->

      <div class="space-y-4">

        <!-- URL -->

        <UCard>

          <template #header>

            <h2 class="font-bold text-default">
              Адреса прайсу
            </h2>

          </template>

          <div class="space-y-3">

            <div
              class="rounded-xl border border-border bg-elevated px-4 py-3"
            >

              <div class="text-xs text-muted">
                QR-код веде на:
              </div>

              <div
                class="mt-1 break-all text-sm font-semibold text-primary"
              >
                {{ priceUrl }}
              </div>

            </div>

            <UButton
              :to="priceUrl"
              target="_blank"
              color="neutral"
              variant="outline"
              icon="i-lucide-external-link"
              block
            >
              Відкрити прайс
            </UButton>

          </div>

        </UCard>

        <!-- Actions -->

        <UCard>

          <template #header>

            <h2 class="font-bold text-default">
              Дії
            </h2>

          </template>

          <div class="space-y-3">

            <UButton
              color="primary"
              icon="i-lucide-download"
              block
              :disabled="generating"
              @click="downloadQr"
            >
              Завантажити PNG
            </UButton>

            <UButton
              color="neutral"
              variant="outline"
              icon="i-lucide-printer"
              block
              :disabled="generating"
              @click="printQr"
            >
              Друкувати
            </UButton>

          </div>

        </UCard>

        <!-- Info -->

        <UCard>

          <div class="flex gap-3">

            <div
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
            >

              <Icon
                name="i-lucide-info"
                class="h-5 w-5"
              />

            </div>

            <div>

              <h3
                class="font-semibold text-default"
              >
                QR-код статичний
              </h3>

              <p
                class="mt-1 text-sm leading-5 text-muted"
              >
                Він веде на адресу
                <strong>/price</strong>.
                Якщо ти змінюєш ціни або послуги
                в адмінці, QR-код змінювати
                не потрібно.
              </p>

            </div>

          </div>

        </UCard>

      </div>

    </div>

  </div>
</template>

