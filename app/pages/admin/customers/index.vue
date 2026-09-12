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
  createdAt: string
  updatedAt: string
}

const search = ref('')

const showCreateModal = ref(false)
const creating = ref(false)

const newCustomer = reactive({
  name: '',
  phone: ''
})

const {
  data: customers,
  refresh,
  status
} = await useFetch<Customer[]>('/api/admin/customers', {
  query: {
    search
  }
})

watch(search, () => {
  refresh()
})

const totalCustomers = computed(() => {
  return customers.value?.length || 0
})

const totalBonuses = computed(() => {
  return customers.value?.reduce(
    (sum, customer) => sum + customer.bonusBalance,
    0
  ) || 0
})

const totalPurchases = computed(() => {
  return customers.value?.reduce(
    (sum, customer) => sum + customer.purchaseCount,
    0
  ) || 0
})

const totalRevenue = computed(() => {
  return customers.value?.reduce(
    (sum, customer) => sum + customer.totalSpent,
    0
  ) || 0
})

function formatMoney(value: number) {
  return new Intl.NumberFormat('uk-UA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(value)
}

function formatDate(value: string | null) {
  if (!value) {
    return '—'
  }

  return new Intl.DateTimeFormat('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(value))
}

async function createCustomer() {
  if (!newCustomer.name.trim()) {
    alert('Вкажіть ім’я клієнта')
    return
  }

  if (!newCustomer.phone.trim()) {
    alert('Вкажіть номер телефону')
    return
  }

  creating.value = true

  try {
    const response = await $fetch('/api/admin/customers', {
      method: 'POST',

      body: {
        name: newCustomer.name,
        phone: newCustomer.phone
      }
    })

    newCustomer.name = ''
    newCustomer.phone = ''

    showCreateModal.value = false

    await refresh()
  } catch (error: any) {
    alert(
      error?.data?.statusMessage ||
      error?.statusMessage ||
      'Не вдалося створити клієнта'
    )
  } finally {
    creating.value = false
  }
}
</script>

<template>
  <section class="space-y-6">

    <!-- Заголовок -->

    <div
      class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h1 class="text-2xl font-bold">
          Клієнти
        </h1>

        <p class="text-sm text-muted mt-1">
          Клієнтська база та бонусна програма Mobilon
        </p>
      </div>

      <UButton
        icon="i-lucide-user-plus"
        @click="showCreateModal = true"
      >
        Додати клієнта
      </UButton>
    </div>

    <!-- Статистика -->

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">

      <UCard>
        <div class="text-center">
          <p class="text-sm text-muted">
            👥 Клієнтів
          </p>

          <p class="text-2xl font-bold mt-1">
            {{ totalCustomers }}
          </p>
        </div>
      </UCard>

      <UCard>
        <div class="text-center">
          <p class="text-sm text-muted">
            🧾 Покупок
          </p>

          <p class="text-2xl font-bold mt-1">
            {{ totalPurchases }}
          </p>
        </div>
      </UCard>

      <UCard>
        <div class="text-center">
          <p class="text-sm text-muted">
            🎁 Бонусів
          </p>

          <p class="text-2xl font-bold mt-1">
            {{ totalBonuses }}
          </p>
        </div>
      </UCard>

      <UCard>
        <div class="text-center">
          <p class="text-sm text-muted">
            💰 Продажі
          </p>

          <p class="text-xl sm:text-2xl font-bold mt-1">
            {{ formatMoney(totalRevenue) }} ₴
          </p>
        </div>
      </UCard>

    </div>

    <!-- Пошук -->

    <UCard>
      <UInput
        v-model="search"
        icon="i-lucide-search"
        placeholder="Пошук по імені або телефону..."
        class="w-full"
      />
    </UCard>

    <!-- Завантаження -->

    <div
      v-if="status === 'pending'"
      class="py-10 text-center text-muted"
    >
      Завантаження...
    </div>

    <!-- Немає клієнтів -->

    <UCard
      v-else-if="!customers?.length"
    >
      <div class="py-10 text-center">

        <div class="text-4xl mb-3">
          👥
        </div>

        <p class="font-medium">
          Клієнтів поки немає
        </p>

        <p class="text-sm text-muted mt-1">
          Додайте першого клієнта до бази Mobilon
        </p>

        <UButton
          class="mt-4"
          icon="i-lucide-user-plus"
          @click="showCreateModal = true"
        >
          Додати клієнта
        </UButton>

      </div>
    </UCard>

    <!-- Клієнти -->

    <div
      v-else
      class="space-y-3"
    >
      <NuxtLink
        v-for="customer in customers"
        :key="customer.id"
        :to="`/admin/customers/${customer.id}`"
        class="block"
      >
        <UCard
          class="
            transition
            hover:ring-1
            hover:ring-primary/30
          "
        >
          <div
            class="
              flex
              flex-col
              gap-4
              md:flex-row
              md:items-center
              md:justify-between
            "
          >

            <!-- Клієнт -->

            <div class="min-w-0">

              <div class="flex flex-wrap items-center gap-2">

                <p class="font-semibold text-lg">
                  {{ customer.name }}
                </p>

                <UBadge
                  v-if="customer.loyaltyActive"
                  color="success"
                  variant="soft"
                >
                  Бонусна програма
                </UBadge>

                <UBadge
                  v-if="customer.hasCard"
                  color="primary"
                  variant="soft"
                >
                  Картка
                </UBadge>

              </div>

              <a
                :href="`tel:${customer.phone}`"
                class="
                  text-sm
                  text-primary
                  hover:underline
                  inline-block
                  mt-1
                "
                @click.stop
              >
                {{ customer.phone }}
              </a>

            </div>

            <!-- Показники -->

            <div
              class="
                grid
                grid-cols-2
                gap-x-6
                gap-y-3
                sm:grid-cols-4
                md:text-right
              "
            >

              <div>
                <p class="text-xs text-muted">
                  Бонуси
                </p>

                <p class="font-semibold">
                  {{ customer.bonusBalance }}
                </p>
              </div>

              <div>
                <p class="text-xs text-muted">
                  Покупки
                </p>

                <p class="font-semibold">
                  {{ customer.purchaseCount }}
                </p>
              </div>

              <div>
                <p class="text-xs text-muted">
                  Витрачено
                </p>

                <p class="font-semibold">
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
      </NuxtLink>
    </div>

    <!-- Створення клієнта -->

    <UModal v-model:open="showCreateModal">

      <template #content>
        <UCard>

          <template #header>
            <div>
              <h2 class="text-lg font-semibold">
                Новий клієнт
              </h2>

              <p class="text-sm text-muted mt-1">
                Додайте клієнта до бази Mobilon
              </p>
            </div>
          </template>

          <div class="space-y-4">

            <UFormField
              label="Ім’я"
              required
            >
              <UInput
                v-model="newCustomer.name"
                placeholder="Наприклад: Іван"
                class="w-full"
              />
            </UFormField>

            <UFormField
              label="Телефон"
              required
            >
              <UInput
                v-model="newCustomer.phone"
                type="tel"
                placeholder="+380..."
                class="w-full"
              />
            </UFormField>

          </div>

          <template #footer>
            <div class="flex justify-end gap-2">

              <UButton
                color="neutral"
                variant="soft"
                :disabled="creating"
                @click="showCreateModal = false"
              >
                Скасувати
              </UButton>

              <UButton
                :loading="creating"
                @click="createCustomer"
              >
                Створити
              </UButton>

            </div>
          </template>

        </UCard>
      </template>

    </UModal>

  </section>
</template>