<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

interface Customer {
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

interface SaleItem {
  id: number
  name: string
  type: 'PRODUCT' | 'SERVICE'
  quantity: number
  unitPrice: number
}

interface CompletedSale {
  purchaseId: number
  totalAmount: number
  bonusUsed: number
  bonusEarned: number
  bonusBalanceAfter: number
}

interface BonusPolicy {
  id: number
  rewardPercent: number | string
  maxRedeemPercent: number | string
  rewardProducts: boolean
  rewardServices: boolean
  rewardOnBonusPaidPart: boolean
}

interface BonusPolicyResponse {
  success: boolean
  currentPolicy: BonusPolicy | null
}

const { data: bonusPolicyData } =
  await useFetch<BonusPolicyResponse>(
    '/api/admin/bonus-policy'
  )

const currentPolicy = computed(() => {
  return bonusPolicyData.value?.currentPolicy ?? null
})

const search = ref('')
const selectedCustomer = ref<Customer | null>(null)
const saleItems = ref<SaleItem[]>([
  {
    id: Date.now(),
    name: '',
    type: 'PRODUCT',
    quantity: 1,
    unitPrice: 0
  }
])

const bonusUsed = ref(0)
const saleSaving = ref(false)
const completedSale = ref<CompletedSale | null>(null)

const toast = useToast()

function addSaleItem() {
  saleItems.value.push({
    id: Date.now() + Math.random(),
    name: '',
     type: 'PRODUCT',
    quantity: 1,
    unitPrice: 0
  })
}

function removeSaleItem(id: number) {
  if (saleItems.value.length === 1) {
    saleItems.value[0] = {
      id: Date.now(),
      name: '',
       type: 'PRODUCT',
      quantity: 1,
      unitPrice: 0
    }

    return
  }

  saleItems.value =
    saleItems.value.filter(item => item.id !== id)
}

function itemTotal(item: SaleItem) {
  const quantity = Number(item.quantity) || 0
  const unitPrice = Number(item.unitPrice) || 0

  return quantity * unitPrice
}

const saleTotal = computed(() => {
  return saleItems.value.reduce(
    (sum, item) => sum + itemTotal(item),
    0
  )
})

const maxBonusByPolicy = computed(() => {
  if (
    !selectedCustomer.value?.loyaltyActive ||
    !currentPolicy.value
  ) {
    return 0
  }

  const percent =
    Number(currentPolicy.value.maxRedeemPercent)

  const maxByPercent = Math.floor(
    saleTotal.value * percent / 100
  )

  return Math.min(
    selectedCustomer.value.bonusBalance,
    maxByPercent,
    Math.floor(saleTotal.value)
  )
})

const amountToPay = computed(() => {
  return Math.max(
    0,
    saleTotal.value - Number(bonusUsed.value || 0)
  )
})

const estimatedBonusEarned = computed(() => {
  if (
    !selectedCustomer.value?.loyaltyActive ||
    !currentPolicy.value ||
    saleTotal.value <= 0
  ) {
    return 0
  }

  const percent =
    Number(currentPolicy.value.rewardPercent)

  const eligibleAmount = saleItems.value.reduce(
    (sum, item) => {
      const total = itemTotal(item)

      if (
        item.type === 'PRODUCT' &&
        currentPolicy.value?.rewardProducts
      ) {
        return sum + total
      }

      if (
        item.type === 'SERVICE' &&
        currentPolicy.value?.rewardServices
      ) {
        return sum + total
      }

      return sum
    },
    0
  )

  if (eligibleAmount <= 0) {
    return 0
  }

  let rewardBase = eligibleAmount

  if (
    !currentPolicy.value.rewardOnBonusPaidPart &&
    Number(bonusUsed.value || 0) > 0
  ) {
    const paidRatio =
      amountToPay.value / saleTotal.value

    rewardBase =
      eligibleAmount * paidRatio
  }

  return Math.floor(
    rewardBase * percent / 100
  )
})

const saleItemTypes = [
  {
    label: 'Товар',
    value: 'PRODUCT'
  },
  {
    label: 'Послуга',
    value: 'SERVICE'
  }
]

const {
  data: customers,
  status
} = await useFetch<Customer[]>(
  '/api/admin/customers',
  {
    query: {
      search
    },

    default: () => []
  }
)

function selectCustomer(customer: Customer) {
  selectedCustomer.value = customer
}

function clearCustomer() {
  selectedCustomer.value = null
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('uk-UA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(value)
}

async function createSale() {
  if (!selectedCustomer.value) {
    return
  }

  const validItems = saleItems.value.filter(item => {
    return (
      item.name.trim() &&
      Number(item.quantity) > 0 &&
      Number(item.unitPrice) >= 0
    )
  })

  if (!validItems.length) {
    toast.add({
      title: 'Додайте хоча б одну позицію',
      color: 'error'
    })

    return
  }

  const bonuses = Number(bonusUsed.value || 0)

  if (
    !Number.isInteger(bonuses) ||
    bonuses < 0
  ) {
    toast.add({
      title: 'Некоректна кількість бонусів',
      color: 'error'
    })

    return
  }

  if (bonuses > maxBonusByPolicy.value) {
    toast.add({
      title: 'Забагато бонусів',
      description:
        `Можна використати максимум ${maxBonusByPolicy.value}`,
      color: 'error'
    })

    return
  }

  saleSaving.value = true

  try {
const result = await $fetch('/api/admin/sales', {
  method: 'POST',

  body: {
    customerId: selectedCustomer.value.id,
    bonusUsed: bonuses,

    items: validItems.map(item => ({
      type: item.type,
      name: item.name.trim(),
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice)
    }))
  }
})

completedSale.value = {
  purchaseId: result.purchase.id,
  totalAmount: Number(result.purchase.totalAmount),
  bonusUsed: result.bonusUsed,
  bonusEarned: result.bonusEarned,
  bonusBalanceAfter: result.bonusBalanceAfter
}


    toast.add({
      title: 'Покупку проведено',
      description:
        `Нараховано ${result.bonusEarned} бонусів`,
      color: 'success'
    })

    selectedCustomer.value = {
      ...selectedCustomer.value,
      bonusBalance: result.bonusBalanceAfter
    }

    saleItems.value = [
      {
        id: Date.now(),
        name: '',
        type: 'PRODUCT',
        quantity: 1,
        unitPrice: 0
      }
    ]

    bonusUsed.value = 0
  } catch (error: any) {
    toast.add({
      title: 'Не вдалося провести покупку',
      description:
        error?.data?.statusMessage ||
        'Помилка створення покупки',
      color: 'error'
    })
  } finally {
    saleSaving.value = false
  }
}
</script>

<template>
  <section class="space-y-6">

    <!-- Заголовок -->

    <div>
      <UButton
        to="/admin/customers"
        color="neutral"
        variant="ghost"
        icon="i-lucide-arrow-left"
        class="mb-3"
      >
        Назад
      </UButton>

      <h1 class="text-2xl font-bold">
        Нова покупка
      </h1>

      <p class="text-sm text-muted mt-1">
        Оформлення продажу товарів та послуг
      </p>
    </div>

<UCard
  v-if="completedSale"
  class="border border-success"
>
  <div
    class="
      flex
      flex-col
      gap-5
      sm:flex-row
      sm:items-center
      sm:justify-between
    "
  >
    <div class="flex items-start gap-3">

      <div
        class="
          w-10
          h-10
          rounded-full
          bg-success/10
          flex
          items-center
          justify-center
          shrink-0
        "
      >
        <Icon
          name="i-lucide-check"
          class="w-5 h-5 text-success"
        />
      </div>

      <div>
        <h2 class="font-semibold text-lg">
          Покупку проведено
        </h2>

        <p class="text-sm text-muted">
          Покупка №{{ completedSale.purchaseId }}
        </p>
      </div>

    </div>

    <div
      class="
        grid
        grid-cols-2
        gap-x-6
        gap-y-3
        sm:grid-cols-4
      "
    >

      <div>
        <p class="text-xs text-muted">
          Сума
        </p>

        <p class="font-semibold">
          {{ formatMoney(completedSale.totalAmount) }} ₴
        </p>
      </div>

      <div>
        <p class="text-xs text-muted">
          Списано
        </p>

        <p class="font-semibold">
          {{ completedSale.bonusUsed }}
        </p>
      </div>

      <div>
        <p class="text-xs text-muted">
          Нараховано
        </p>

        <p class="font-semibold text-success">
          +{{ completedSale.bonusEarned }}
        </p>
      </div>

      <div>
        <p class="text-xs text-muted">
          Новий баланс
        </p>

        <p class="font-semibold">
          {{ completedSale.bonusBalanceAfter }}
        </p>
      </div>

    </div>

  </div>
</UCard>

    <!-- Вибраний клієнт -->

    <UCard v-if="selectedCustomer">
      <template #header>
        <div class="flex items-center justify-between gap-4">
          <div>
            <h2 class="font-semibold">
              Клієнт
            </h2>

            <p class="text-sm text-muted">
              Покупка буде записана на цього клієнта
            </p>
          </div>

          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-x"
            @click="clearCustomer"
          >
            Змінити
          </UButton>
        </div>
      </template>

      <div
        class="
          flex
          flex-col
          gap-5
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div>
          <p class="text-lg font-semibold">
            {{ selectedCustomer.name }}
          </p>

          <a
            :href="`tel:${selectedCustomer.phone}`"
            class="text-primary hover:underline"
          >
            {{ selectedCustomer.phone }}
          </a>

          <div class="flex flex-wrap gap-2 mt-3">

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
              Є картка
            </UBadge>

          </div>
        </div>

        <div class="sm:text-right">
          <p class="text-sm text-muted">
            Доступний баланс
          </p>

          <p class="text-2xl font-bold">
            {{ selectedCustomer.bonusBalance }}
          </p>

          <p class="text-sm text-muted">
            бонусів
          </p>
        </div>
      </div>
    </UCard>

    <!-- Пошук клієнта -->

    <UCard v-else>
      <template #header>
        <div>
          <h2 class="font-semibold">
            1. Виберіть клієнта
          </h2>

          <p class="text-sm text-muted mt-1">
            Знайдіть клієнта за ім’ям або номером телефону
          </p>
        </div>
      </template>

      <UInput
        v-model="search"
        icon="i-lucide-search"
        placeholder="Ім’я або номер телефону..."
        size="lg"
        class="w-full"
      />

      <div
        v-if="status === 'pending'"
        class="py-8 text-center text-muted"
      >
        Завантаження...
      </div>

      <div
        v-else-if="!customers?.length"
        class="py-8 text-center text-muted"
      >
        Клієнтів не знайдено
      </div>

      <div
        v-else
        class="mt-4 divide-y divide-default"
      >
        <button
          v-for="customer in customers"
          :key="customer.id"
          type="button"
          class="
            w-full
            flex
            items-center
            justify-between
            gap-4
            py-4
            text-left
            hover:bg-elevated
            transition-colors
            px-2
            rounded-lg
          "
          @click="selectCustomer(customer)"
        >
          <div>
            <p class="font-medium">
              {{ customer.name }}
            </p>

            <p class="text-sm text-muted">
              {{ customer.phone }}
            </p>
          </div>

          <div class="text-right">
            <p class="font-semibold">
              {{ customer.bonusBalance }} бонусів
            </p>

            <p class="text-xs text-muted">
              {{ formatMoney(customer.totalSpent) }} ₴ покупок
            </p>
          </div>
        </button>
      </div>
    </UCard>

    <!-- Наступний етап -->

    <!-- Позиції покупки -->

<UCard v-if="selectedCustomer">
  <template #header>
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
        <h2 class="font-semibold">
          2. Позиції покупки
        </h2>

        <p class="text-sm text-muted mt-1">
          Введіть товари або послуги з чека
        </p>
      </div>

      <UButton
        icon="i-lucide-plus"
        variant="soft"
        @click="addSaleItem"
      >
        Додати позицію
      </UButton>
    </div>
  </template>

  <div class="space-y-4">

    <div
      v-for="(item, index) in saleItems"
      :key="item.id"
      class="
        rounded-lg
        border
        border-default
        p-4
      "
    >
      <div
        class="
          grid
          gap-4
          md:grid-cols-[140px_1fr_120px_160px_auto]
          md:items-end
        "
      >
<UFormField label="Тип">
  <USelect
    v-model="item.type"
    :items="saleItemTypes"
    class="w-full"
  />
</UFormField>
        <!-- Назва -->

        <UFormField
          :label="`Позиція ${index + 1}`"
        >
          <UInput
            v-model="item.name"
            placeholder="Наприклад: Кабель Type-C"
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

        <UFormField label="Ціна, ₴">
          <UInput
            v-model.number="item.unitPrice"
            type="number"
            min="0"
            step="0.01"
            class="w-full"
          />
        </UFormField>

        <!-- Видалити -->

        <UButton
          icon="i-lucide-trash-2"
          color="error"
          variant="ghost"
          class="mb-0.5"
          @click="removeSaleItem(item.id)"
        />

      </div>

      <div
        class="
          flex
          justify-end
          mt-3
          text-sm
        "
      >
        <span class="text-muted mr-2">
          Сума:
        </span>

        <span class="font-semibold">
          {{ formatMoney(itemTotal(item)) }} ₴
        </span>
      </div>
    </div>

  </div>

  <!-- Разом -->

  <div
    class="
      flex
      justify-between
      items-center
      mt-6
      pt-5
      border-t
      border-default
    "
  >
    <span class="text-lg font-semibold">
      Разом
    </span>

    <span class="text-2xl font-bold">
      {{ formatMoney(saleTotal) }} ₴
    </span>
  </div>
</UCard>
<UCard v-if="selectedCustomer">
  <template #header>
    <div>
      <h2 class="font-semibold">
        3. Розрахунок
      </h2>

      <p class="text-sm text-muted mt-1">
        Підсумок покупки та бонуси
      </p>
      <p
  v-if="currentPolicy"
  class="text-xs text-muted mt-1"
>
  Нарахування:
  {{ Number(currentPolicy.rewardPercent) }}%
  · Максимальне списання:
  {{ Number(currentPolicy.maxRedeemPercent) }}%
</p>
    </div>
  </template>

  <div class="space-y-5">

    <div
      class="
        grid
        gap-4
        sm:grid-cols-2
        lg:grid-cols-4
      "
    >
      <div>
        <p class="text-sm text-muted">
          Сума покупки
        </p>

        <p class="text-xl font-bold">
          {{ formatMoney(saleTotal) }} ₴
        </p>
      </div>

      <div>
        <p class="text-sm text-muted">
          Баланс бонусів
        </p>

        <p class="text-xl font-bold">
          {{ selectedCustomer.bonusBalance }}
        </p>
      </div>

      <div>
        <p class="text-sm text-muted">
          Максимум можна списати
        </p>

        <p class="text-xl font-bold">
          {{ maxBonusByPolicy }}
        </p>
      </div>

      <div>
        <p class="text-sm text-muted">
          Буде нараховано
        </p>

        <p class="text-xl font-bold text-success">
          +{{ estimatedBonusEarned }}
        </p>
      </div>
    </div>

    <UFormField
      v-if="selectedCustomer.loyaltyActive"
      label="Використати бонусів"
      :description="`Максимум: ${maxBonusByPolicy}`"
    >
      <UInput
        v-model.number="bonusUsed"
        type="number"
        min="0"
        :max="maxBonusByPolicy"
        class="w-full sm:max-w-xs"
      />
    </UFormField>

    <div
      v-else
      class="
        rounded-lg
        bg-elevated
        p-4
        text-sm
        text-muted
      "
    >
      Бонусна програма для цього клієнта не активна.
    </div>

    <div
      class="
        flex
        flex-col
        gap-4
        border-t
        border-default
        pt-5
        sm:flex-row
        sm:items-center
        sm:justify-between
      "
    >
      <div>
        <p class="text-sm text-muted">
          До оплати
        </p>

        <p class="text-3xl font-bold">
          {{ formatMoney(amountToPay) }} ₴
        </p>
      </div>

      <UButton
        size="lg"
        icon="i-lucide-check"
        :loading="saleSaving"
        :disabled="saleTotal <= 0"
        @click="createSale"
      >
        Провести покупку
      </UButton>
    </div>

  </div>
</UCard>        
  </section>
</template>