<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

interface FiscalReceipt {
  receiptNumber: string
  fiscalNumber: string
  date: string
  time: string
  amount: number
  url: string
}

interface BonusPolicy {
  id: number

  rewardPercent: string | number

  smartphoneRewardPercent: string | number
  featurePhoneRewardPercent: string | number
  accessoryRewardPercent: string | number
  serviceRewardPercent: string | number

  maxRewardPoints: number | null
  maxRedeemPercent: string | number

  rewardProducts: boolean
  rewardServices: boolean
  rewardOnBonusPaidPart: boolean
}

interface CustomerSearchResult {
  id: number
  name: string
  phone: string
  loyaltyActive: boolean
  hasCard: boolean
  bonusBalance: number
  purchaseCount: number
  totalSpent: number
  lastPurchase: string | null
}

type BonusCategory =
  | 'SMARTPHONE'
  | 'FEATURE_PHONE'
  | 'ACCESSORY'
  | 'SERVICE'
  | 'NO_REWARD'

interface ReceiptItem {
  id: number
  name: string
  quantity: number
  unitPrice: number
  bonusCategory: BonusCategory
}

const bonusCategoryOptions = [
  {
    label: 'Смартфон — 1%',
    value: 'SMARTPHONE'
  },
  {
    label: 'Кнопковий телефон — 2%',
    value: 'FEATURE_PHONE'
  },
  {
    label: 'Аксесуар / товар — 5%',
    value: 'ACCESSORY'
  },
  {
    label: 'Послуга — 5%',
    value: 'SERVICE'
  },
  {
    label: 'Без бонусів — 0%',
    value: 'NO_REWARD'
  }
]

const customRewardAmount = ref<number | null>(null)
const customerPhone = ref('')
const customerSearching = ref(false)
const customerSearchDone = ref(false)

const foundCustomers = ref<CustomerSearchResult[]>([])
const selectedCustomer = ref<CustomerSearchResult | null>(null)

const showCreateCustomer = ref(false)
const customerCreating = ref(false)

const newCustomer = reactive({
  name: '',
  phone: ''
})


const receiptPhotoFile = ref<File | null>(null)
const receiptPhotoPreview = ref<string | null>(null)
const receiptPhotoInput = ref<HTMLInputElement | null>(null)

const recognizingReceipt = ref(false)
const recognitionError = ref('')


function openReceiptPhotoCamera() {
  receiptPhotoInput.value?.click()
}

function handleReceiptPhoto(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) {
    return
  }

  receiptPhotoFile.value = file

  if (receiptPhotoPreview.value) {
    URL.revokeObjectURL(receiptPhotoPreview.value)
  }

  receiptPhotoPreview.value =
    URL.createObjectURL(file)
}

function removeReceiptPhoto() {
  if (receiptPhotoPreview.value) {
    URL.revokeObjectURL(receiptPhotoPreview.value)
  }

  receiptPhotoFile.value = null
  receiptPhotoPreview.value = null

  if (receiptPhotoInput.value) {
    receiptPhotoInput.value.value = ''
  }
}

async function compressReceiptImage(
  file: File,
  maxSize = 1800,
  quality = 0.85
): Promise<File> {
  const bitmap = await createImageBitmap(file)

  let width = bitmap.width
  let height = bitmap.height

  // Зменшуємо тільки великі фотографії
  if (width > maxSize || height > maxSize) {
    const scale = Math.min(
      maxSize / width,
      maxSize / height
    )

    width = Math.round(width * scale)
    height = Math.round(height * scale)
  }

  const canvas = document.createElement('canvas')

  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')

  if (!context) {
    bitmap.close()
    throw new Error(
      'Не вдалося підготувати фото для розпізнавання'
    )
  }

  // Білий фон корисний для фотографій чеків
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, width, height)

  context.drawImage(
    bitmap,
    0,
    0,
    width,
    height
  )

  bitmap.close()

  const blob = await new Promise<Blob>(
    (resolve, reject) => {
      canvas.toBlob(
        result => {
          if (result) {
            resolve(result)
          } else {
            reject(
              new Error(
                'Не вдалося стиснути фотографію'
              )
            )
          }
        },
        'image/jpeg',
        quality
      )
    }
  )

  return new File(
    [blob],
    'receipt.jpg',
    {
      type: 'image/jpeg',
      lastModified: Date.now()
    }
  )
}


async function recognizeReceiptPhoto() {
  if (!receiptPhotoFile.value) {
    recognitionError.value =
      'Спочатку сфотографуйте чек.'
    return
  }

  recognizingReceipt.value = true
  recognitionError.value = ''

  try {
    const originalFile = receiptPhotoFile.value

const compressedFile =
  await compressReceiptImage(originalFile)

console.log(
  'Фото чека:',
  {
    original:
      `${(originalFile.size / 1024 / 1024).toFixed(2)} MB`,

    compressed:
      `${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`
  }
)

const formData = new FormData()

formData.append(
  'image',
  compressedFile
)

    const response = await $fetch<{
      success: boolean
      items: Array<{
        name: string
        quantity: number
        unitPrice: number
        bonusCategory: BonusCategory
      }>
      recognizedTotal: number
    }>('/api/admin/receipt-recognize', {
      method: 'POST',
      body: formData
    })

    receiptItems.value =
      response.items.map(item => ({
        id: ++receiptItemId,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        bonusCategory: item.bonusCategory
      }))

    console.log(
      'Розпізнані позиції:',
      response.items
    )

    console.log(
      'Розпізнана сума:',
      response.recognizedTotal
    )
  } catch (error: any) {
    console.error(
      'Receipt recognition error:',
      error
    )

    recognitionError.value =
      error?.data?.statusMessage ||
      error?.statusMessage ||
      'Не вдалося розпізнати чек.'
  } finally {
    recognizingReceipt.value = false
  }
}

const receiptItems = ref<ReceiptItem[]>([])

let receiptItemId = 0

function addReceiptItem() {
  receiptItems.value.push({
    id: ++receiptItemId,
    name: '',
    quantity: 1,
    unitPrice: 0,
    bonusCategory: 'ACCESSORY'
  })
}

function removeReceiptItem(id: number) {
  receiptItems.value =
    receiptItems.value.filter(
      item => item.id !== id
    )
}

const toast = useToast()

const scanning = ref(false)
const scannerStarted = ref(false)
const decodedText = ref('')
const resolving = ref(false)

const receipt = ref<FiscalReceipt | null>(null)

const rewardEnabled = ref(true)
const rewardMode = ref<'FULL' | 'CUSTOM'>('FULL')
//const customRewardAmount = ref<number | null>(null)

let html5QrCode: any = null
const saleSaving = ref(false)

const completedSale = ref<{
  purchaseId: number
  totalAmount: number
  bonusEarned: number
  bonusBalanceAfter: number
} | null>(null)
/* ==================================================
   BONUS POLICY
================================================== */

const { data: policyData } = await useFetch<{
  success: boolean
  currentPolicy: BonusPolicy | null
}>('/api/admin/bonus-policy')

const currentPolicy = computed(() => {
  return policyData.value?.currentPolicy ?? null
})



/* ==================================================
   RECEIPT PARSER
================================================== */

function parseFiscalReceipt(text: string): FiscalReceipt | null {
  try {
    const url = new URL(text)

    if (url.hostname !== 'cabinet.tax.gov.ua') {
      return null
    }

    if (!url.pathname.startsWith('/cashregs/check')) {
      return null
    }

    const receiptNumber = url.searchParams.get('id')
    const fiscalNumber = url.searchParams.get('fn')
    const rawDate = url.searchParams.get('date')
    const rawTime = url.searchParams.get('time')
    const rawAmount = url.searchParams.get('sm')

    if (
      !receiptNumber ||
      !fiscalNumber ||
      !rawDate ||
      !rawTime ||
      !rawAmount
    ) {
      return null
    }

    if (!/^\d{8}$/.test(rawDate)) {
      return null
    }

    if (!/^\d{6}$/.test(rawTime)) {
      return null
    }

    const amount = Number(
      rawAmount.replace(',', '.')
    )

    if (!Number.isFinite(amount) || amount < 0) {
      return null
    }

    const year = rawDate.slice(0, 4)
    const month = rawDate.slice(4, 6)
    const day = rawDate.slice(6, 8)

    const hours = rawTime.slice(0, 2)
    const minutes = rawTime.slice(2, 4)
    const seconds = rawTime.slice(4, 6)

    return {
      receiptNumber,
      fiscalNumber,
      date: `${day}.${month}.${year}`,
      time: `${hours}:${minutes}:${seconds}`,
      amount,
      url: text
    }
  } catch {
    return null
  }
}

/* ==================================================
   BONUS CALCULATION
================================================== */

const rewardBase = computed(() => {
  if (!receipt.value || !rewardEnabled.value) {
    return 0
  }

  if (rewardMode.value === 'FULL') {
    return receipt.value.amount
  }

  const value = Number(customRewardAmount.value ?? 0)

  if (!Number.isFinite(value) || value <= 0) {
    return 0
  }

  return Math.min(value, receipt.value.amount)
})

const estimatedBonus = computed(() => {
  if (
    !rewardEnabled.value ||
    !currentPolicy.value
  ) {
    return 0
  }

  const policy = currentPolicy.value

  let total = 0

  for (const item of receiptItems.value) {
    let percent = 0

    switch (item.bonusCategory) {
      case 'SMARTPHONE':
        percent = Number(
          policy.smartphoneRewardPercent
        )
        break

      case 'FEATURE_PHONE':
        percent = Number(
          policy.featurePhoneRewardPercent
        )
        break

      case 'ACCESSORY':
        percent = Number(
          policy.accessoryRewardPercent
        )
        break

      case 'SERVICE':
        percent = Number(
          policy.serviceRewardPercent
        )
        break

      case 'NO_REWARD':
        percent = 0
        break
    }

    const itemTotal =
      Number(item.quantity || 0) *
      Number(item.unitPrice || 0)

    total += Math.floor(
      itemTotal * percent / 100
    )
  }

  const maxRewardPoints =
    policy.maxRewardPoints

  if (
    maxRewardPoints !== null &&
    total > maxRewardPoints
  ) {
    return maxRewardPoints
  }

  return total
})

/* ==================================================
   RECEIPT ITEMS TOTAL CHECK
================================================== */

/*
 * Загальна сума всіх введених позицій.
 */
const receiptItemsTotal = computed(() => {
  const total = receiptItems.value.reduce(
    (sum, item) => {
      const quantity =
        Number(item.quantity || 0)

      const unitPrice =
        Number(item.unitPrice || 0)

      return sum + quantity * unitPrice
    },
    0
  )

  return Math.round(total * 100) / 100
})

/*
 * Різниця між введеними позиціями
 * та реальною сумою фіскального чека.
 *
 * +50 = позиції дорожчі на 50 грн
 * -50 = позицій не вистачає на 50 грн
 */
const receiptAmountDifference = computed(() => {
  if (!receipt.value) {
    return 0
  }

  return Math.round(
    (
      receiptItemsTotal.value -
      receipt.value.amount
    ) * 100
  ) / 100
})

/*
 * Чи збігається сума позицій
 * із сумою фіскального чека.
 */
const receiptItemsTotalMatches = computed(() => {
  if (!receipt.value) {
    return false
  }

  if (receiptItems.value.length === 0) {
    return false
  }

  return (
    Math.abs(
      receiptAmountDifference.value
    ) <= 0.01
  )
})

/* ==================================================
   CUSTOMER
================================================== */

async function searchCustomer() {
  const search = customerPhone.value.trim()

  if (!search) {
    toast.add({
      title: 'Введіть номер телефону',
      color: 'warning'
    })
    return
  }

  customerSearching.value = true
  customerSearchDone.value = false
  foundCustomers.value = []
  selectedCustomer.value = null

  try {
    const customers = await $fetch<CustomerSearchResult[]>(
      '/api/admin/customers',
      {
        query: {
          search
        }
      }
    )

    foundCustomers.value = customers
customerSearchDone.value = true

if (customers.length === 0) {
  newCustomer.phone = search
  newCustomer.name = ''
  showCreateCustomer.value = true
}

if (customers.length === 1) {
  selectedCustomer.value =
    customers[0] ?? null

  showCreateCustomer.value = false
}
  } catch (error: any) {
    toast.add({
      title: 'Помилка пошуку клієнта',
      description:
        error?.data?.statusMessage ||
        'Не вдалося виконати пошук',
      color: 'error'
    })
  } finally {
    customerSearching.value = false
  }
}

async function createCustomer() {
  const name = newCustomer.name.trim()
  const phone = newCustomer.phone.trim()

  if (!name) {
    toast.add({
      title: 'Вкажіть ім’я клієнта',
      color: 'warning'
    })
    return
  }

  if (!phone) {
    toast.add({
      title: 'Вкажіть номер телефону',
      color: 'warning'
    })
    return
  }

  customerCreating.value = true

  try {
    const result = await $fetch<{
      success: boolean
      customer: {
        id: number
        name: string
        phone: string
        loyaltyActive: boolean
      }
    }>('/api/admin/customers', {
      method: 'POST',
      body: {
        name,
        phone,
        loyaltyActive: true
      }
    })
await $fetch(
  `/api/admin/customers/${result.customer.id}/card`,
  {
    method: 'POST'
  }
)
    selectedCustomer.value = {
      id: result.customer.id,
      name: result.customer.name,
      phone: result.customer.phone,
      loyaltyActive: result.customer.loyaltyActive,
     hasCard: true,
      bonusBalance: 0,
      purchaseCount: 0,
      totalSpent: 0,
      lastPurchase: null
    }

    customerPhone.value = result.customer.phone
    foundCustomers.value = []
    customerSearchDone.value = false
    showCreateCustomer.value = false

    newCustomer.name = ''
    newCustomer.phone = ''

    toast.add({
      title: 'Клієнта створено',
      description: 'Бонусну програму активовано.',
      color: 'success'
    })
  } catch (error: any) {
    toast.add({
      title: 'Не вдалося створити клієнта',
      description:
        error?.data?.statusMessage ||
        error?.statusMessage ||
        'Сталася помилка',
      color: 'error'
    })
  } finally {
    customerCreating.value = false
  }
}


async function activateCustomerLoyalty() {
  if (!selectedCustomer.value) {
    return
  }

  customerCreating.value = true

  try {
    await $fetch(
      `/api/admin/customers/${selectedCustomer.value.id}`,
      {
        method: 'PATCH',
        body: {
          loyaltyActive: true
        }
      }
    )

    selectedCustomer.value.loyaltyActive = true

    toast.add({
      title: 'Бонусну програму активовано',
      description:
        `${selectedCustomer.value.name} тепер бере участь у бонусній програмі.`,
      color: 'success'
    })
  } catch (error: any) {
    toast.add({
      title: 'Не вдалося активувати бонусну програму',
      description:
        error?.data?.statusMessage ||
        error?.statusMessage ||
        'Сталася помилка',
      color: 'error'
    })
  } finally {
    customerCreating.value = false
  }
}

function selectCustomer(customer: CustomerSearchResult) {
  selectedCustomer.value = customer
}

function clearSelectedCustomer() {
  selectedCustomer.value = null
  foundCustomers.value = []
  customerSearchDone.value = false
  customerPhone.value = ''
}

function getFiscalReceiptDate() {
  if (!receipt.value) {
    return null
  }

  const [day, month, year] =
    receipt.value.date.split('.')

  if (!day || !month || !year) {
    return null
  }

  return `${year}-${month}-${day}T${receipt.value.time}`
}


async function createFiscalSale() {
  if (!receipt.value) {
    toast.add({
      title: 'Чек не знайдено',
      color: 'error'
    })
    return
  }

  if (!selectedCustomer.value) {
    toast.add({
      title: 'Виберіть клієнта',
      color: 'warning'
    })
    return
  }

  if (
    rewardEnabled.value &&
    rewardMode.value === 'CUSTOM' &&
    rewardBase.value <= 0
  ) {
    toast.add({
      title: 'Вкажіть суму для нарахування бонусів',
      color: 'warning'
    })
    return
  }

  saleSaving.value = true

  try {
    const result = await $fetch<{
      success: boolean

      purchase: {
        id: number
        totalAmount: string | number
      }

      bonusEarned: number
      bonusBalanceAfter: number
    }>('/api/admin/sales', {
      method: 'POST',

      body: {
        customerId: selectedCustomer.value.id,

        source: 'FISCAL_QR',

items: receiptItems.value.map(item => ({
  type:
    item.bonusCategory === 'SERVICE'
      ? 'SERVICE'
      : item.bonusCategory === 'NO_REWARD'
        ? 'OTHER'
        : 'PRODUCT',

  bonusCategory: item.bonusCategory,

  name: item.name.trim(),

  quantity: Number(item.quantity),

  unitPrice: Number(item.unitPrice)
})),

        totalAmount: receipt.value.amount,

        fiscalReceiptNumber:
          receipt.value.receiptNumber,

        fiscalDeviceNumber:
          receipt.value.fiscalNumber,

        fiscalReceiptDate:
          getFiscalReceiptDate(),

        fiscalReceiptUrl:
          receipt.value.url,

        rewardEnabled:
          rewardEnabled.value,

        rewardAmount:
          rewardEnabled.value
            ? rewardBase.value
            : 0,

        /*
         * Після видачі фіскального чека
         * бонуси вже не списуємо.
         */
        bonusUsed: 0
      }
    })

    completedSale.value = {
      purchaseId: result.purchase.id,
      totalAmount:
        Number(result.purchase.totalAmount),

      bonusEarned:
        result.bonusEarned,

      bonusBalanceAfter:
        result.bonusBalanceAfter
    }

    /*
     * Одразу оновлюємо баланс
     * у вибраного клієнта.
     */
    selectedCustomer.value.bonusBalance =
      result.bonusBalanceAfter

    toast.add({
      title: 'Покупку проведено',
      description:
        result.bonusEarned > 0
          ? `Нараховано +${result.bonusEarned} бонусів`
          : 'Покупку збережено без бонусів',
      color: 'success'
    })
  } catch (error: any) {
    toast.add({
      title: 'Не вдалося провести покупку',
      description:
        error?.data?.statusMessage ||
        error?.statusMessage ||
        'Сталася помилка',
      color: 'error'
    })
  } finally {
    saleSaving.value = false
  }
}
/* ==================================================
   SCANNER
================================================== */

async function startScanner() {
  if (scanning.value) return

  decodedText.value = ''
  receipt.value = null
completedSale.value = null
  rewardEnabled.value = true
  rewardMode.value = 'FULL'
  customRewardAmount.value = null
selectedCustomer.value = null
foundCustomers.value = []
customerSearchDone.value = false
customerPhone.value = ''
  try {
    scannerStarted.value = true

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

        const parsedReceipt = parseFiscalReceipt(text)

        if (!parsedReceipt) {
          resolving.value = false

          toast.add({
            title: 'Це не фіскальний чек',
            description:
              'QR-код не містить даних фіскального чека ДПС.',
            color: 'error'
          })

          return
        }

        decodedText.value = text
        receipt.value = parsedReceipt

        await stopScanner()

        toast.add({
          title: 'Чек прочитано',
          description: `Сума: ${parsedReceipt.amount.toFixed(2)} грн`,
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

  removeReceiptPhoto()
receiptItems.value = []

  decodedText.value = ''
  receipt.value = null
  scannerStarted.value = false
completedSale.value = null
  rewardEnabled.value = true
  rewardMode.value = 'FULL'
  customRewardAmount.value = null
selectedCustomer.value = null
foundCustomers.value = []
customerSearchDone.value = false
customerPhone.value = ''
  nextTick(() => {
    startScanner()
  })
}

onBeforeUnmount(async () => {
  await stopScanner()
})
</script>

<template>
  <section class="space-y-6">

    <!-- HEADER -->
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

        <!-- START -->
        <div
          v-if="!scannerStarted && !receipt"
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

        <!-- SCANNER -->
        <div
          v-if="scannerStarted && !receipt"
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

        <!-- RECEIPT -->
        <div
          v-if="receipt"
          class="space-y-6"
        >
          <UAlert
            color="success"
            variant="soft"
            icon="i-lucide-circle-check"
            title="Фіскальний чек прочитано"
          />

          <!-- RECEIPT INFO -->
          <div class="rounded-xl bg-elevated p-4 space-y-3">

            <div class="flex justify-between gap-4">
              <span class="text-muted">
                Номер чека
              </span>

              <span class="font-medium">
                {{ receipt.receiptNumber }}
              </span>
            </div>

            <div class="flex justify-between gap-4">
              <span class="text-muted">
                Дата
              </span>

              <span class="font-medium">
                {{ receipt.date }}
              </span>
            </div>

            <div class="flex justify-between gap-4">
              <span class="text-muted">
                Час
              </span>

              <span class="font-medium">
                {{ receipt.time }}
              </span>
            </div>

            <div
              class="flex justify-between gap-4 pt-3 border-t border-default"
            >
              <span class="font-medium">
                Сума чека
              </span>

              <span class="text-xl font-bold">
                {{ receipt.amount.toFixed(2) }} грн
              </span>
            </div>

          </div>

<!-- RECEIPT PHOTO -->

<div class="space-y-4">
  <div>
    <h2 class="text-lg font-semibold">
      Таблиця чека
    </h2>

    <p class="text-sm text-muted">
      Сфотографуйте частину чека з товарами та послугами.
    </p>
  </div>

  <!-- Прихований input камери -->
  <input
    ref="receiptPhotoInput"
    type="file"
    accept="image/*"
    capture="environment"
    class="hidden"
    @change="handleReceiptPhoto"
  >

  <!-- Фото ще немає -->
  <UButton
    v-if="!receiptPhotoPreview"
    block
    size="lg"
    variant="soft"
    icon="i-lucide-camera"
    @click="openReceiptPhotoCamera"
  >
    Сканувати позиції чека
  </UButton>

  <!-- Прев'ю -->
  <div
    v-else
    class="rounded-xl border border-default overflow-hidden"
  >
    <img
      :src="receiptPhotoPreview"
      alt="Фото таблиці фіскального чека"
      class="w-full max-h-[500px] object-contain bg-elevated"
    >

    <div class="p-3 flex flex-wrap gap-2">
      <UButton
        icon="i-lucide-camera"
        variant="soft"
        @click="openReceiptPhotoCamera"
      >
        Зняти ще раз
      </UButton>

      <UButton
        color="error"
        variant="soft"
        icon="i-lucide-trash-2"
        @click="removeReceiptPhoto"
      >
        Видалити фото
      </UButton>

      <UButton
  block
  size="lg"
  icon="i-lucide-scan-text"
  :loading="recognizingReceipt"
  :disabled="recognizingReceipt"
  @click="recognizeReceiptPhoto"
>
  Розпізнати позиції
</UButton>

<UAlert
  v-if="recognitionError"
  color="error"
  variant="soft"
  icon="i-lucide-triangle-alert"
  title="Помилка розпізнавання"
  :description="recognitionError"
/>
    </div>
  </div>
</div>



<!-- RECEIPT ITEMS -->

<div class="space-y-4">

  <div
    class="
      flex
      flex-col
      gap-3
      sm:flex-row
      sm:items-center
      sm:justify-between
    "
  >
    <div>
      <h2 class="text-lg font-semibold">
        Позиції чека
      </h2>

      <p class="text-sm text-muted">
        Додайте товари та послуги з фіскального чека
      </p>
    </div>

    <UButton
      icon="i-lucide-plus"
      variant="soft"
      @click="addReceiptItem"
    >
      Додати позицію
    </UButton>
  </div>


  <!-- Поки позицій немає -->

  <UAlert
    v-if="receiptItems.length === 0"
    color="neutral"
    variant="soft"
    icon="i-lucide-list-plus"
    title="Позиції ще не додані"
    description="Додайте позиції з фіскального чека."
  />


  <!-- Позиції -->

  <div
    v-for="(item, index) in receiptItems"
    :key="item.id"
    class="
      rounded-xl
      border
      border-default
      p-4
      space-y-4
    "
  >

    <div
      class="
        grid
        gap-4
        md:grid-cols-[1fr_180px_100px_140px_auto]
        md:items-end
      "
    >

      <!-- Назва -->

      <UFormField
        :label="`Позиція ${index + 1}`"
      >
        <UInput
          v-model="item.name"
          placeholder="Наприклад: Samsung Galaxy A17"
          class="w-full"
        />
      </UFormField>


      <!-- Категорія -->

      <UFormField label="Категорія">
        <USelect
          v-model="item.bonusCategory"
          :items="bonusCategoryOptions"
          class="w-full"
        />
      </UFormField>


      <!-- Кількість -->

      <UFormField label="Кількість">
        <UInput
          v-model.number="item.quantity"
          type="number"
          min="0.001"
          step="1"
          class="w-full"
        />
      </UFormField>


      <!-- Ціна -->

      <UFormField label="Ціна">
        <UInput
          v-model.number="item.unitPrice"
          type="number"
          min="0"
          step="0.01"
          class="w-full"
        >
          <template #trailing>
            грн
          </template>
        </UInput>
      </UFormField>


      <!-- Видалити -->

      <UButton
        color="error"
        variant="soft"
        icon="i-lucide-trash-2"
        square
        @click="removeReceiptItem(item.id)"
      />

    </div>


    <!-- Сума позиції -->

    <div class="text-sm text-muted text-right">
      Сума:
      <span class="font-semibold text-default">
        {{
          (
            Number(item.quantity || 0) *
            Number(item.unitPrice || 0)
          ).toFixed(2)
        }}
        грн
      </span>
    </div>

  </div>

</div>

<!-- RECEIPT TOTAL CHECK -->

<div
  v-if="receiptItems.length > 0"
  class="rounded-xl border border-default p-4 space-y-3"
>
  <div class="flex justify-between gap-4">
    <span class="text-muted">
      Сума фіскального чека
    </span>

    <span class="font-semibold">
      {{ receipt.amount.toFixed(2) }} грн
    </span>
  </div>

  <div class="flex justify-between gap-4">
    <span class="text-muted">
      Сума позицій
    </span>

    <span class="font-semibold">
      {{ receiptItemsTotal.toFixed(2) }} грн
    </span>
  </div>

  <div
    class="flex justify-between gap-4 pt-3 border-t border-default"
  >
    <span class="font-semibold">
      Різниця
    </span>

    <span
      class="font-bold"
      :class="
        receiptItemsTotalMatches
          ? 'text-success'
          : 'text-error'
      "
    >
      {{
        receiptAmountDifference > 0
          ? '+'
          : ''
      }}{{ receiptAmountDifference.toFixed(2) }} грн
    </span>
  </div>

  <UAlert
    v-if="receiptItemsTotalMatches"
    color="success"
    variant="soft"
    icon="i-lucide-circle-check"
    title="Суми збігаються"
    description="Позиції відповідають сумі фіскального чека."
  />

  <UAlert
    v-else
    color="error"
    variant="soft"
    icon="i-lucide-triangle-alert"
    title="Суми не збігаються"
    description="Перевірте кількість і ціну позицій перед проведенням покупки."
  />
</div>

<!-- BONUS SETTINGS -->

          <!-- BONUS SETTINGS -->
          <div class="space-y-5">

            <div class="flex items-center justify-between gap-4">

              <div>
                <p class="font-semibold">
                  Нарахувати бонуси
                </p>

                <p class="text-sm text-muted">
                  Додати бонуси клієнту за цю покупку
                </p>
              </div>

              <USwitch
                v-model="rewardEnabled"
              />

            </div>

            <template v-if="rewardEnabled">

              <div>
                <p class="font-medium mb-3">
                  На яку суму нарахувати бонуси?
                </p>

                <div class="grid gap-3 sm:grid-cols-2">

                  <UButton
                    block
                    size="lg"
                    :variant="
                      rewardMode === 'FULL'
                        ? 'solid'
                        : 'soft'
                    "
                    @click="rewardMode = 'FULL'"
                  >
                    Весь чек
                    {{ receipt.amount.toFixed(2) }} грн
                  </UButton>

                  <UButton
                    block
                    size="lg"
                    :variant="
                      rewardMode === 'CUSTOM'
                        ? 'solid'
                        : 'soft'
                    "
                    @click="rewardMode = 'CUSTOM'"
                  >
                    Інша сума
                  </UButton>

                </div>
              </div>

              <!-- CUSTOM AMOUNT -->
              <UFormField
                v-if="rewardMode === 'CUSTOM'"
                label="Сума для нарахування бонусів"
              >
                <UInput
                  v-model.number="customRewardAmount"
                  type="number"
                  min="0"
                  :max="receipt.amount"
                  step="0.01"
                  placeholder="0.00"
                  size="lg"
                  class="w-full"
                >
                  <template #trailing>
                    грн
                  </template>
                </UInput>
              </UFormField>

              <!-- CALCULATION -->
              <div
                class="rounded-xl border border-default p-4 space-y-3"
              >
                <div class="flex justify-between">
                  <span class="text-muted">
                    Бонусна сума
                  </span>

                  <span class="font-medium">
                    {{ rewardBase.toFixed(2) }} грн
                  </span>
                </div>

                <div class="flex justify-between">
                  <span class="text-muted">
                    Відсоток
                  </span>

                  <span class="font-medium">
                    {{ rewardPercent }}%
                  </span>
                </div>

                <div
                  class="flex justify-between pt-3 border-t border-default"
                >
                  <span class="font-semibold">
                    Буде нараховано
                  </span>

                  <span class="text-xl font-bold text-primary">
                    +{{ estimatedBonus }} бонусів
                  </span>
                </div>
              </div>

            </template>

            <!-- NO BONUS -->
            <UAlert
              v-else
              color="neutral"
              variant="soft"
              icon="i-lucide-circle-minus"
              title="Без нарахування бонусів"
              description="Покупку можна буде зберегти в історії клієнта без бонусів."
            />

          </div>

      <!-- CUSTOMER -->
<div class="space-y-4 pt-2">

  <div>
    <h2 class="text-lg font-semibold">
      Клієнт
    </h2>

    <p class="text-sm text-muted">
      Знайдіть клієнта за номером телефону
    </p>
  </div>

  <!-- SEARCH -->
  <div
    v-if="!selectedCustomer"
    class="space-y-3"
  >
    <UFormField label="Номер телефону">
      <div class="flex gap-2">

        <UInput
          v-model="customerPhone"
          type="tel"
          inputmode="tel"
          autocomplete="tel"
          placeholder="097 777 77 77"
          size="lg"
          class="flex-1"
          @keyup.enter="searchCustomer"
        />

        <UButton
          icon="i-lucide-search"
          size="lg"
          :loading="customerSearching"
          @click="searchCustomer"
        >
          Знайти
        </UButton>

      </div>
    </UFormField>

   <!-- NOT FOUND / CREATE CUSTOMER -->

<div
  v-if="
    customerSearchDone &&
    foundCustomers.length === 0
  "
  class="space-y-4"
>
  <UAlert
    color="warning"
    variant="soft"
    icon="i-lucide-user-x"
    title="Клієнта не знайдено"
    description="Створіть нового клієнта та одразу підключіть бонусну програму."
  />

  <div
    v-if="showCreateCustomer"
    class="rounded-xl border border-default p-4 space-y-4"
  >
    <div>
      <p class="font-semibold">
        Новий клієнт
      </p>

      <p class="text-sm text-muted">
        Бонусна програма буде активована автоматично.
      </p>
    </div>

    <UFormField label="Ім’я клієнта">
      <UInput
        v-model="newCustomer.name"
        placeholder="Наприклад: Іван"
        size="lg"
        class="w-full"
        autofocus
      />
    </UFormField>

    <UFormField label="Номер телефону">
      <UInput
        v-model="newCustomer.phone"
        type="tel"
        inputmode="tel"
        autocomplete="tel"
        placeholder="097 777 77 77"
        size="lg"
        class="w-full"
        @keyup.enter="createCustomer"
      />
    </UFormField>

    <UButton
      block
      size="lg"
      icon="i-lucide-user-plus"
      :loading="customerCreating"
      @click="createCustomer"
    >
      Створити та підключити бонуси
    </UButton>
  </div>
</div>
    <!-- MULTIPLE RESULTS -->
    <div
      v-if="foundCustomers.length > 1"
      class="space-y-2"
    >
      <button
        v-for="customer in foundCustomers"
        :key="customer.id"
        type="button"
        class="w-full text-left rounded-xl border border-default p-4 hover:bg-elevated transition"
        @click="selectCustomer(customer)"
      >
        <div class="font-semibold">
          {{ customer.name }}
        </div>

        <div class="text-sm text-muted">
          {{ customer.phone }}
        </div>

        <div class="text-sm mt-1">
          {{ customer.bonusBalance }} бонусів
        </div>
      </button>
    </div>

  </div>

  <!-- SELECTED CUSTOMER -->
  <div
    v-if="selectedCustomer"
    class="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-4"
  >
    <div class="flex items-start justify-between gap-4">

      <div>
        <p class="text-sm text-muted">
          Вибраний клієнт
        </p>

        <p class="text-lg font-bold">
          {{ selectedCustomer.name }}
        </p>

        <a
          :href="`tel:+${selectedCustomer.phone}`"
          class="text-sm text-primary"
        >
          +{{ selectedCustomer.phone }}
        </a>
      </div>

      <UIcon
        name="i-lucide-circle-check"
        class="size-7 text-primary"
      />

    </div>

    <div class="grid grid-cols-2 gap-3">

      <div class="rounded-lg bg-elevated p-3">
        <p class="text-xs text-muted">
          Баланс
        </p>

        <p class="font-bold">
          {{ selectedCustomer.bonusBalance }}
          бонусів
        </p>
      </div>

      <div class="rounded-lg bg-elevated p-3">
        <p class="text-xs text-muted">
          Покупок
        </p>

        <p class="font-bold">
          {{ selectedCustomer.purchaseCount }}
        </p>
      </div>

    </div>

    <div class="flex items-center gap-2">
      <UBadge
        :color="
          selectedCustomer.loyaltyActive
            ? 'success'
            : 'neutral'
        "
        variant="soft"
      >
        {{
          selectedCustomer.loyaltyActive
            ? 'Бонусна програма активна'
            : 'Бонусна програма не активна'
        }}
      </UBadge>
<UButton
  v-if="!selectedCustomer.loyaltyActive"
  size="xs"
  icon="i-lucide-gift"
  :loading="customerCreating"
  @click="activateCustomerLoyalty"
>
  Підключити бонусну програму
</UButton>

      <UBadge
        v-if="selectedCustomer.hasCard"
        color="primary"
        variant="soft"
      >
        QR-картка
      </UBadge>
    </div>

    <UButton
      color="neutral"
      variant="soft"
      icon="i-lucide-refresh-cw"
      @click="clearSelectedCustomer"
    >
      Інший клієнт
    </UButton>
  </div>

</div>
<!-- COMPLETE SALE -->
<div
  v-if="selectedCustomer && !completedSale"
  class="pt-4 space-y-3"
>
  <div
    class="rounded-xl border border-default p-4 space-y-2"
  >
    <div class="flex justify-between gap-4">
      <span class="text-muted">
        Покупка
      </span>

      <span class="font-semibold">
        {{ receipt.amount.toFixed(2) }} грн
      </span>
    </div>

    <div class="flex justify-between gap-4">
      <span class="text-muted">
        Клієнт
      </span>

      <span class="font-semibold">
        {{ selectedCustomer.name }}
      </span>
    </div>

    <div class="flex justify-between gap-4">
      <span class="text-muted">
        Буде нараховано
      </span>

      <span
        class="font-bold"
        :class="
          estimatedBonus > 0
            ? 'text-primary'
            : ''
        "
      >
        +{{ estimatedBonus }} бонусів
      </span>
    </div>
  </div>

<UButton
  block
  size="xl"
  icon="i-lucide-circle-check"
  :loading="saleSaving"
  :disabled="!receiptItemsTotalMatches"
  @click="createFiscalSale"
>
  Провести покупку ·
  {{ receipt.amount.toFixed(2) }} грн
</UButton>

  <p class="text-xs text-muted text-center">
    Після проведення покупка буде записана
    в історію клієнта.
  </p>
</div>
<!-- SALE COMPLETED -->
<div
  v-if="completedSale"
  class="space-y-4"
>
  <UAlert
    color="success"
    variant="soft"
    icon="i-lucide-circle-check-big"
    title="Покупку успішно проведено"
  />

  <div
    class="rounded-xl border border-default p-4 space-y-3"
  >
    <div class="flex justify-between">
      <span class="text-muted">
        Покупка №
      </span>

      <span class="font-medium">
        {{ completedSale.purchaseId }}
      </span>
    </div>

    <div class="flex justify-between">
      <span class="text-muted">
        Сума
      </span>

      <span class="font-medium">
        {{ completedSale.totalAmount.toFixed(2) }}
        грн
      </span>
    </div>

    <div class="flex justify-between">
      <span class="text-muted">
        Нараховано
      </span>

      <span class="font-bold text-primary">
        +{{ completedSale.bonusEarned }}
        бонусів
      </span>
    </div>

    <div
      class="flex justify-between pt-3 border-t border-default"
    >
      <span class="font-semibold">
        Новий баланс
      </span>

      <span class="text-xl font-bold">
        {{ completedSale.bonusBalanceAfter }}
        бонусів
      </span>
    </div>
  </div>
</div>

          <UButton
            color="neutral"
            variant="soft"
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