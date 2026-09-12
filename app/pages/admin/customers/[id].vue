<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

interface PurchaseItem {
  id: number
  name: string
  type: string
  quantity: string | number
  unitPrice: string | number
  totalPrice: string | number
}

interface Purchase {
  id: number
  totalAmount: string | number
  bonusUsed: number
  paidAmount: string | number
  bonusEarned: number
  status: string
  source: string
  createdAt: string
  items: PurchaseItem[]
}

interface BonusTransaction {
  id: number
  amount: number
  type: string | null
  reason: string
  description: string | null
  createdAt: string
}

interface Request {
  id: number
  description: string | null
  createdAt: string
}

interface Customer {
  id: number
  name: string
  phone: string
  notes: string | null

  loyaltyActive: boolean
  cardToken: string | null
  telegramChatId: string | null

  active: boolean
  createdAt: string
  updatedAt: string

  bonusBalance: number
  purchaseCount: number
  totalSpent: number
  lastPurchase: string | null
  hasCard: boolean

  requests: Request[]
  purchases: Purchase[]
  bonusTransactions: BonusTransaction[]
}

interface CustomerResponse {
  success: boolean
  customer: Customer
}

const route = useRoute()
const toast = useToast()

const notes = ref('')
const bonusAmount = ref<number>(10)
const bonusReason = ref('')
const bonusSaving = ref(false)
const notesSaving = ref(false)
const loyaltySaving = ref(false)
// покупка
const saleSaving = ref(false)

const saleForm = reactive({
  name: 'Тестова послуга',
  price: 1000,
  bonusUsed: 0
})

async function createTestSale() {
  const price = Number(saleForm.price)
  const bonusUsed = Number(saleForm.bonusUsed)

  if (!saleForm.name.trim()) {
    toast.add({
      title: 'Вкажіть назву позиції',
      color: 'error'
    })
    return
  }

  if (!Number.isFinite(price) || price <= 0) {
    toast.add({
      title: 'Вкажіть коректну суму',
      color: 'error'
    })
    return
  }

  if (!Number.isInteger(bonusUsed) || bonusUsed < 0) {
    toast.add({
      title: 'Некоректна кількість бонусів',
      color: 'error'
    })
    return
  }

  saleSaving.value = true

  try {
    const result = await $fetch('/api/admin/sales', {
      method: 'POST',

      body: {
        customerId: customer.value?.id,

        bonusUsed,

        items: [
          {
            type: 'SERVICE',
            name: saleForm.name.trim(),
            quantity: 1,
            unitPrice: price
          }
        ]
      }
    })

    toast.add({
      title: 'Покупку створено',
      description:
        `Нараховано ${result.bonusEarned} бонусів`,
      color: 'success'
    })

    saleForm.name = 'Тестова послуга'
    saleForm.price = 1000
    saleForm.bonusUsed = 0

    await refresh()
  } catch (error: any) {
    toast.add({
      title: 'Не вдалося створити покупку',
      description:
        error?.data?.statusMessage ||
        'Помилка створення покупки',
      color: 'error'
    })
  } finally {
    saleSaving.value = false
  }
}

//______________________
const {
  data,
  refresh,
  status
} = await useFetch<CustomerResponse>(
  `/api/admin/customers/${route.params.id}`
)

const customer = computed(() => data.value?.customer ?? null)

watch(
  customer,
  (value) => {
    if (value) {
      notes.value = value.notes || ''
    }
  },
  {
    immediate: true
  }
)

function formatMoney(value: number | string) {
  return new Intl.NumberFormat('uk-UA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(Number(value))
}

function formatDate(value: string | null) {
  if (!value) {
    return '—'
  }

  return new Intl.DateTimeFormat('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value))
}

function bonusTypeName(type: string | null) {
  switch (type) {
    case 'PURCHASE_REWARD':
      return 'Нарахування за покупку'

    case 'PURCHASE_PAYMENT':
      return 'Оплата бонусами'

    case 'REFUND':
      return 'Повернення'

    case 'ADMIN_ADJUSTMENT':
      return 'Коригування'

    case 'EXPIRED':
      return 'Згорілі бонуси'

    case 'INITIAL_BALANCE':
      return 'Початковий баланс'

    default:
      return 'Бонусна операція'
  }
}

async function saveNotes() {
  notesSaving.value = true

  try {
    await $fetch(
      `/api/admin/customers/${route.params.id}`,
      {
        method: 'PATCH',

        body: {
          notes: notes.value
        }
      }
    )

    toast.add({
      title: 'Нотатки збережено',
      color: 'success'
    })

    await refresh()
  } catch (error: any) {
    toast.add({
      title: 'Помилка збереження',
      description:
        error?.data?.statusMessage ||
        'Не вдалося зберегти нотатки',
      color: 'error'
    })
  } finally {
    notesSaving.value = false
  }
}

async function toggleLoyalty(value: boolean) {
  loyaltySaving.value = true

  try {
    await $fetch(
      `/api/admin/customers/${route.params.id}`,
      {
        method: 'PATCH',

        body: {
          loyaltyActive: value
        }
      }
    )

    toast.add({
      title: value
        ? 'Бонусну програму активовано'
        : 'Бонусну програму вимкнено',
      color: 'success'
    })

    await refresh()
  } catch (error: any) {
    toast.add({
      title: 'Помилка',
      description:
        error?.data?.statusMessage ||
        'Не вдалося змінити статус бонусної програми',
      color: 'error'
    })
  } finally {
    loyaltySaving.value = false
  }
}

async function adjustBonus() {
  const amount = Number(bonusAmount.value)

  if (!Number.isInteger(amount) || amount === 0) {
    toast.add({
      title: 'Вкажіть кількість бонусів',
      color: 'error'
    })

    return
  }

  if (!bonusReason.value.trim()) {
    toast.add({
      title: 'Вкажіть причину коригування',
      color: 'error'
    })

    return
  }

  bonusSaving.value = true

  try {
    await $fetch(
      `/api/admin/customers/${route.params.id}/bonus`,
      {
        method: 'POST',

        body: {
          amount,
          reason: bonusReason.value
        }
      }
    )

    bonusReason.value = ''
    bonusAmount.value = 10

    toast.add({
      title:
        amount > 0
          ? `Нараховано ${amount} бонусів`
          : `Списано ${Math.abs(amount)} бонусів`,
      color: 'success'
    })

    await refresh()
  } catch (error: any) {
    toast.add({
      title: 'Помилка',
      description:
        error?.data?.statusMessage ||
        'Не вдалося змінити бонусний баланс',
      color: 'error'
    })
  } finally {
    bonusSaving.value = false
  }
}
</script>

<template>
  <section class="space-y-6">

    <div>
      <UButton
        to="/admin/customers"
        color="neutral"
        variant="ghost"
        icon="i-lucide-arrow-left"
        class="mb-3"
      >
        Назад до клієнтів
      </UButton>

      <h1 class="text-2xl font-bold">
        Картка клієнта
      </h1>
    </div>

    <div
      v-if="status === 'pending'"
      class="py-10 text-center text-muted"
    >
      Завантаження...
    </div>

    <template v-else-if="customer">

      <!-- Основна інформація -->

      <UCard>
        <div
          class="
            flex
            flex-col
            gap-5
            lg:flex-row
            lg:items-start
            lg:justify-between
          "
        >
          <div>
            <div class="flex flex-wrap items-center gap-2">

              <h2 class="text-xl font-semibold">
                {{ customer.name }}
              </h2>

              <UBadge
                v-if="customer.loyaltyActive"
                color="success"
                variant="soft"
              >
                Бонусна програма активна
              </UBadge>

              <UBadge
                v-if="customer.hasCard"
                color="primary"
                variant="soft"
              >
                Є картка
              </UBadge>

            </div>

            <a
              :href="`tel:${customer.phone}`"
              class="
                inline-block
                mt-2
                text-primary
                hover:underline
              "
            >
              {{ customer.phone }}
            </a>

            <p class="text-sm text-muted mt-2">
              Клієнт з {{ formatDate(customer.createdAt) }}
            </p>
          </div>

          <div
            class="
              grid
              grid-cols-2
              sm:grid-cols-4
              gap-5
            "
          >

            <div>
              <p class="text-xs text-muted">
                Баланс
              </p>

              <p class="text-xl font-bold">
                {{ customer.bonusBalance }}
              </p>

              <p class="text-xs text-muted">
                бонусів
              </p>
            </div>

            <div>
              <p class="text-xs text-muted">
                Покупок
              </p>

              <p class="text-xl font-bold">
                {{ customer.purchaseCount }}
              </p>
            </div>

            <div>
              <p class="text-xs text-muted">
                Витрачено
              </p>

              <p class="text-xl font-bold">
                {{ formatMoney(customer.totalSpent) }} ₴
              </p>
            </div>

            <div>
              <p class="text-xs text-muted">
                Остання покупка
              </p>

              <p class="font-semibold">
                {{ formatDate(customer.lastPurchase) }}
              </p>
            </div>

          </div>
        </div>
      </UCard>


      <UCard>
  <div
    class="
      flex
      flex-col
      gap-4
      sm:flex-row
      sm:items-center
      sm:justify-between
    "
  >
    <div>
      <h2 class="font-semibold">
        🎁 Бонусна програма
      </h2>

      <p class="text-sm text-muted mt-1">
        Дозволяє клієнту накопичувати та використовувати бонуси
      </p>
    </div>

    <USwitch
      :model-value="customer.loyaltyActive"
      :disabled="loyaltySaving"
      @update:model-value="toggleLoyalty"
    />
  </div>
</UCard>
<!-- Створення тестової покупки -->
 <UCard>
  <template #header>
    <div>
      <h2 class="font-semibold">
        🧾 Тестова покупка
      </h2>

      <p class="text-sm text-muted mt-1">
        Тимчасова форма для перевірки нарахування та списання бонусів
      </p>
    </div>
  </template>

  <div class="grid gap-4 md:grid-cols-3">

    <UFormField label="Назва">
      <UInput
        v-model="saleForm.name"
        class="w-full"
      />
    </UFormField>

    <UFormField label="Сума покупки">
      <UInput
        v-model.number="saleForm.price"
        type="number"
        min="0"
        class="w-full"
      />
    </UFormField>

    <UFormField
      label="Використати бонусів"
      :description="`Баланс: ${customer.bonusBalance}`"
    >
      <UInput
        v-model.number="saleForm.bonusUsed"
        type="number"
        min="0"
        class="w-full"
      />
    </UFormField>

  </div>

  <div class="mt-4">
    <UButton
      icon="i-lucide-shopping-cart"
      :loading="saleSaving"
      @click="createTestSale"
    >
      Провести покупку
    </UButton>
  </div>
</UCard>

      <!-- Нотатки -->

      <UCard>
        <template #header>
          <div>
            <h2 class="font-semibold">
              📝 Нотатки
            </h2>

            <p class="text-sm text-muted mt-1">
              Внутрішня інформація про клієнта
            </p>
          </div>
        </template>

        <UTextarea
          v-model="notes"
          :rows="5"
          placeholder="Додайте інформацію про клієнта..."
          class="w-full"
        />

        <div class="mt-4">
          <UButton
            :loading="notesSaving"
            @click="saveNotes"
          >
            Зберегти
          </UButton>
        </div>
      </UCard>

      <!-- Ручна корекція бонусів -->

      <UCard>
        <template #header>
          <div>
            <h2 class="font-semibold">
              🎁 Коригування бонусів
            </h2>

            <p class="text-sm text-muted mt-1">
              Використовуйте тільки для ручного коригування
            </p>
          </div>
        </template>

        <div class="grid gap-4 sm:grid-cols-2">

          <UFormField
            label="Кількість бонусів"
            description="Додатне число — нарахувати, від’ємне — списати"
          >
            <UInput
              v-model.number="bonusAmount"
              type="number"
              class="w-full"
            />
          </UFormField>

          <UFormField
            label="Причина"
            required
          >
            <UInput
              v-model="bonusReason"
              placeholder="Наприклад: компенсація клієнту"
              class="w-full"
            />
          </UFormField>

        </div>

        <div class="mt-4">
          <UButton
            :loading="bonusSaving"
            @click="adjustBonus"
          >
            Застосувати
          </UButton>
        </div>
      </UCard>

      <!-- Історія бонусів -->

      <UCard>
        <template #header>
          <div>
            <h2 class="font-semibold">
              Історія бонусів
            </h2>

            <p class="text-sm text-muted mt-1">
              Усі нарахування та списання
            </p>
          </div>
        </template>

        <div
          v-if="!customer.bonusTransactions.length"
          class="text-sm text-muted py-4"
        >
          Бонусних операцій поки немає.
        </div>

        <div
          v-else
          class="divide-y divide-default"
        >
          <div
            v-for="transaction in customer.bonusTransactions"
            :key="transaction.id"
            class="
              flex
              flex-col
              gap-2
              py-3
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >

            <div>
              <p class="font-medium">
                {{ bonusTypeName(transaction.type) }}
              </p>

              <p class="text-sm text-muted">
                {{ transaction.reason }}
              </p>

              <p class="text-xs text-muted mt-1">
                {{ formatDate(transaction.createdAt) }}
              </p>
            </div>

            <div
              class="text-lg font-bold"
              :class="
                transaction.amount >= 0
                  ? 'text-success'
                  : 'text-error'
              "
            >
              {{ transaction.amount > 0 ? '+' : '' }}
              {{ transaction.amount }}
            </div>

          </div>
        </div>
      </UCard>

      <!-- Покупки -->

      <UCard>
        <template #header>
          <div>
            <h2 class="font-semibold">
              🧾 Історія покупок
            </h2>

            <p class="text-sm text-muted mt-1">
              Товари та послуги клієнта
            </p>
          </div>
        </template>

        <div
          v-if="!customer.purchases.length"
          class="text-sm text-muted py-4"
        >
          Покупок поки немає.
        </div>

        <div
          v-else
          class="space-y-3"
        >
          <div
            v-for="purchase in customer.purchases"
            :key="purchase.id"
            class="
              rounded-lg
              border
              border-default
              p-4
            "
          >
            <div
              class="
                flex
                flex-col
                gap-2
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <div>
                <p class="font-semibold">
                  Покупка №{{ purchase.id }}
                </p>

                <p class="text-sm text-muted">
                  {{ formatDate(purchase.createdAt) }}
                </p>
              </div>

              <div class="sm:text-right">

                <p class="text-lg font-bold">
                  {{ formatMoney(purchase.totalAmount) }} ₴
                </p>

                <p class="text-sm text-muted">
                  +{{ purchase.bonusEarned }} бонусів
                </p>

              </div>
            </div>

            <div
              v-if="purchase.items?.length"
              class="mt-4 space-y-2"
            >
              <div
                v-for="item in purchase.items"
                :key="item.id"
                class="
                  flex
                  justify-between
                  gap-4
                  text-sm
                "
              >
                <span>
                  {{ item.name }}
                  × {{ item.quantity }}
                </span>

                <span class="font-medium">
                  {{ formatMoney(item.totalPrice) }} ₴
                </span>
              </div>
            </div>

          </div>
        </div>
      </UCard>

      <!-- Старі звернення -->

      <UCard v-if="customer.requests?.length">
        <template #header>
          <h2 class="font-semibold">
            Старі звернення
          </h2>
        </template>

        <div class="space-y-2">
          <div
            v-for="request in customer.requests"
            :key="request.id"
            class="text-sm"
          >
            {{ request.description }}
          </div>
        </div>
      </UCard>

    </template>

    <UCard v-else>
      <div class="py-8 text-center">
        Клієнта не знайдено
      </div>
    </UCard>

  </section>
</template>