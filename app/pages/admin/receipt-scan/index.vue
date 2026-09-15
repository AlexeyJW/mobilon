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
const customRewardAmount = ref<number | null>(null)
const customerPhone = ref('')
const customerSearching = ref(false)
const customerSearchDone = ref(false)

const foundCustomers = ref<CustomerSearchResult[]>([])
const selectedCustomer = ref<CustomerSearchResult | null>(null)


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

const rewardPercent = computed(() => {
  return Number(currentPolicy.value?.rewardPercent ?? 0)
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
  if (!rewardEnabled.value) {
    return 0
  }

  return Math.floor(
    rewardBase.value * rewardPercent.value / 100
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

    if (customers.length === 1) {
      selectedCustomer.value = customers[0] ?? null
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

    <!-- NOT FOUND -->
    <UAlert
      v-if="
        customerSearchDone &&
        foundCustomers.length === 0
      "
      color="warning"
      variant="soft"
      icon="i-lucide-user-x"
      title="Клієнта не знайдено"
      description="Можна буде створити нового клієнта."
    />

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