<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

/* ==================================================
   TYPES
================================================== */

interface BonusPolicy {
  id: number

  // Legacy — поки залишається в API/БД
  rewardPercent: string | number

  smartphoneRewardPercent: string | number
  featurePhoneRewardPercent: string | number
  accessoryRewardPercent: string | number
  serviceRewardPercent: string | number
  maxRewardPoints: number | null

  maxRedeemPercent: string | number

  minPurchaseAmount: string | number | null
  minRedeemPoints: number | null

  activationDelayDays: number
  expirationDays: number | null

  rewardProducts: boolean
  rewardServices: boolean
  rewardOnBonusPaidPart: boolean

  validFrom: string
  validTo: string | null
  createdAt: string
}

/* ==================================================
   STATE
================================================== */

const loading = ref(false)
const saving = ref(false)

const currentPolicy = ref<BonusPolicy | null>(null)
const policies = ref<BonusPolicy[]>([])

const showCreateModal = ref(false)

/* ==================================================
   FORM
================================================== */

const form = reactive({
  smartphoneRewardPercent: 1,
  featurePhoneRewardPercent: 2,
  accessoryRewardPercent: 5,
  serviceRewardPercent: 5,

  maxRewardPoints: 300 as string | number,

  maxRedeemPercent: 20,

  minPurchaseAmount: '' as string | number,
  minRedeemPoints: '' as string | number,

  activationDelayDays: 0,
  expirationDays: '' as string | number,

  rewardOnBonusPaidPart: false,

  validFrom: ''
})

/* ==================================================
   LOAD
================================================== */

async function loadPolicies() {
  loading.value = true

  try {
    const result = await $fetch<{
      success: boolean
      currentPolicy: BonusPolicy | null
      policies: BonusPolicy[]
    }>('/api/admin/bonus-policy')

    currentPolicy.value = result.currentPolicy
    policies.value = result.policies
  } catch (error: any) {
    console.error(
      'Failed to load bonus policies:',
      error
    )

    alert(
      error?.data?.statusMessage ||
      'Не вдалося завантажити бонусну політику'
    )
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadPolicies()
})

/* ==================================================
   CREATE POLICY
================================================== */

function openCreateModal() {
  if (currentPolicy.value) {
    form.smartphoneRewardPercent =
      Number(
        currentPolicy.value.smartphoneRewardPercent
      )

    form.featurePhoneRewardPercent =
      Number(
        currentPolicy.value.featurePhoneRewardPercent
      )

    form.accessoryRewardPercent =
      Number(
        currentPolicy.value.accessoryRewardPercent
      )

    form.serviceRewardPercent =
      Number(
        currentPolicy.value.serviceRewardPercent
      )

    form.maxRewardPoints =
      currentPolicy.value.maxRewardPoints ?? ''

    form.maxRedeemPercent =
      Number(currentPolicy.value.maxRedeemPercent)

    form.minPurchaseAmount =
      currentPolicy.value.minPurchaseAmount ?? ''

    form.minRedeemPoints =
      currentPolicy.value.minRedeemPoints ?? ''

    form.activationDelayDays =
      currentPolicy.value.activationDelayDays

    form.expirationDays =
      currentPolicy.value.expirationDays ?? ''

    form.rewardOnBonusPaidPart =
      currentPolicy.value.rewardOnBonusPaidPart
  } else {
    form.smartphoneRewardPercent = 1
    form.featurePhoneRewardPercent = 2
    form.accessoryRewardPercent = 5
    form.serviceRewardPercent = 5

    form.maxRewardPoints = 300
    form.maxRedeemPercent = 20

    form.minPurchaseAmount = ''
    form.minRedeemPoints = ''

    form.activationDelayDays = 0
    form.expirationDays = ''

    form.rewardOnBonusPaidPart = false
  }

  /*
   * datetime-local працює у локальному
   * часі браузера.
   */
  const now = new Date()

  const localDate = new Date(
    now.getTime() -
      now.getTimezoneOffset() * 60000
  )

  form.validFrom = localDate
    .toISOString()
    .slice(0, 16)

  showCreateModal.value = true
}

function validPercent(value: unknown) {
  const number = Number(value)

  return (
    Number.isFinite(number) &&
    number >= 0 &&
    number <= 100
  )
}

async function createPolicy() {
  if (
    !validPercent(form.smartphoneRewardPercent)
  ) {
    alert(
      'Вкажіть коректний відсоток для смартфонів'
    )
    return
  }

  if (
    !validPercent(form.featurePhoneRewardPercent)
  ) {
    alert(
      'Вкажіть коректний відсоток для кнопкових телефонів'
    )
    return
  }

  if (
    !validPercent(form.accessoryRewardPercent)
  ) {
    alert(
      'Вкажіть коректний відсоток для товарів та аксесуарів'
    )
    return
  }

  if (
    !validPercent(form.serviceRewardPercent)
  ) {
    alert(
      'Вкажіть коректний відсоток для послуг'
    )
    return
  }

  if (
    !validPercent(form.maxRedeemPercent)
  ) {
    alert(
      'Максимальна оплата бонусами має бути від 0 до 100%'
    )
    return
  }

  if (form.maxRewardPoints !== '') {
    const maxRewardPoints =
      Number(form.maxRewardPoints)

    if (
      !Number.isInteger(maxRewardPoints) ||
      maxRewardPoints <= 0
    ) {
      alert(
        'Максимум бонусів має бути цілим числом більше 0'
      )
      return
    }
  }

  if (!form.validFrom) {
    alert('Вкажіть дату початку дії')
    return
  }

  const confirmed = confirm(
    'Створити нову версію бонусної політики?\n\n' +
    'Попередні покупки та вже нараховані бонуси ' +
    'перераховані не будуть.'
  )

  if (!confirmed) {
    return
  }

  saving.value = true

  try {
    await $fetch('/api/admin/bonus-policy', {
      method: 'POST',

      body: {
        smartphoneRewardPercent:
          Number(form.smartphoneRewardPercent),

        featurePhoneRewardPercent:
          Number(form.featurePhoneRewardPercent),

        accessoryRewardPercent:
          Number(form.accessoryRewardPercent),

        serviceRewardPercent:
          Number(form.serviceRewardPercent),

        maxRewardPoints:
          form.maxRewardPoints === ''
            ? null
            : Number(form.maxRewardPoints),

        maxRedeemPercent:
          Number(form.maxRedeemPercent),

        minPurchaseAmount:
          form.minPurchaseAmount === ''
            ? null
            : Number(form.minPurchaseAmount),

        minRedeemPoints:
          form.minRedeemPoints === ''
            ? null
            : Number(form.minRedeemPoints),

        activationDelayDays:
          Number(form.activationDelayDays),

        expirationDays:
          form.expirationDays === ''
            ? null
            : Number(form.expirationDays),

        /*
         * Legacy flags залишаємо true,
         * поки старий код ще існує.
         */
        rewardProducts: true,
        rewardServices: true,

        rewardOnBonusPaidPart:
          form.rewardOnBonusPaidPart,

        validFrom:
          new Date(
            form.validFrom
          ).toISOString()
      }
    })

    showCreateModal.value = false

    await loadPolicies()
  } catch (error: any) {
    console.error(
      'Failed to create bonus policy:',
      error
    )

    alert(
      error?.data?.statusMessage ||
      'Не вдалося створити бонусну політику'
    )
  } finally {
    saving.value = false
  }
}

/* ==================================================
   HELPERS
================================================== */

function formatPercent(
  value: string | number
) {
  return `${Number(value).toLocaleString(
    'uk-UA'
  )}%`
}

function formatMoney(
  value: string | number | null
) {
  if (value === null) {
    return 'Без обмеження'
  }

  return `${Number(value).toLocaleString(
    'uk-UA'
  )} грн`
}

function formatPoints(
  value: number | null
) {
  if (value === null) {
    return 'Без обмеження'
  }

  return `${value.toLocaleString(
    'uk-UA'
  )} бонусів`
}

function formatDateTime(date: string) {
  return new Date(date).toLocaleString(
    'uk-UA',
    {
      dateStyle: 'short',
      timeStyle: 'short'
    }
  )
}

function policyStatus(
  policy: BonusPolicy
) {
  const now = new Date()

  const from =
    new Date(policy.validFrom)

  const to = policy.validTo
    ? new Date(policy.validTo)
    : null

  if (from > now) {
    return 'scheduled'
  }

  if (to && to <= now) {
    return 'finished'
  }

  return 'active'
}

function statusLabel(
  policy: BonusPolicy
) {
  const status =
    policyStatus(policy)

  if (status === 'active') {
    return 'Активна'
  }

  if (status === 'scheduled') {
    return 'Запланована'
  }

  return 'Завершена'
}

function statusColor(
  policy: BonusPolicy
) {
  const status =
    policyStatus(policy)

  if (status === 'active') {
    return 'success'
  }

  if (status === 'scheduled') {
    return 'warning'
  }

  return 'neutral'
}
</script>

<template>
  <div class="space-y-8">

    <!-- HEADER -->

    <div
      class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h1
          class="text-2xl font-bold text-default"
        >
          Бонусна програма
        </h1>

        <p
          class="mt-1 text-sm text-muted"
        >
          Правила нарахування та використання
          бонусів Mobilon
        </p>
      </div>

      <UButton
        icon="i-lucide-plus"
        color="primary"
        @click="openCreateModal"
      >
        Нова політика
      </UButton>
    </div>

    <!-- LOADING -->

    <UCard v-if="loading">
      <div
        class="py-10 text-center text-muted"
      >
        Завантаження...
      </div>
    </UCard>

    <template v-else>

      <!-- CURRENT POLICY -->

      <div>
        <h2
          class="mb-4 text-lg font-semibold text-default"
        >
          Поточна політика
        </h2>

        <UCard v-if="currentPolicy">
          <div class="space-y-6">

            <div
              class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
            >
              <div
                class="flex items-center gap-3"
              >
                <UIcon
                  name="i-lucide-gift"
                  class="size-7 text-primary"
                />

                <div>
                  <p
                    class="text-xl font-bold"
                  >
                    Бонуси за категоріями
                  </p>

                  <p
                    class="mt-1 text-sm text-muted"
                  >
                    Діє з
                    {{
                      formatDateTime(
                        currentPolicy.validFrom
                      )
                    }}
                  </p>
                </div>
              </div>

              <UBadge
                color="success"
                variant="subtle"
              >
                Активна
              </UBadge>
            </div>

            <!-- CATEGORY RATES -->

            <div
              class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              <div
                class="rounded-xl border border-border p-4"
              >
                <div
                  class="flex items-center gap-2"
                >
                  <UIcon
                    name="i-lucide-smartphone"
                    class="size-5 text-primary"
                  />

                  <p class="text-xs text-muted">
                    Смартфони
                  </p>
                </div>

                <p
                  class="mt-2 text-xl font-bold"
                >
                  {{
                    formatPercent(
                      currentPolicy
                        .smartphoneRewardPercent
                    )
                  }}
                </p>
              </div>

              <div
                class="rounded-xl border border-border p-4"
              >
                <div
                  class="flex items-center gap-2"
                >
                  <UIcon
                    name="i-lucide-phone"
                    class="size-5 text-primary"
                  />

                  <p class="text-xs text-muted">
                    Кнопкові телефони
                  </p>
                </div>

                <p
                  class="mt-2 text-xl font-bold"
                >
                  {{
                    formatPercent(
                      currentPolicy
                        .featurePhoneRewardPercent
                    )
                  }}
                </p>
              </div>

              <div
                class="rounded-xl border border-border p-4"
              >
                <div
                  class="flex items-center gap-2"
                >
                  <UIcon
                    name="i-lucide-package"
                    class="size-5 text-primary"
                  />

                  <p class="text-xs text-muted">
                    Товари / аксесуари
                  </p>
                </div>

                <p
                  class="mt-2 text-xl font-bold"
                >
                  {{
                    formatPercent(
                      currentPolicy
                        .accessoryRewardPercent
                    )
                  }}
                </p>
              </div>

              <div
                class="rounded-xl border border-border p-4"
              >
                <div
                  class="flex items-center gap-2"
                >
                  <UIcon
                    name="i-lucide-wrench"
                    class="size-5 text-primary"
                  />

                  <p class="text-xs text-muted">
                    Послуги / ремонт
                  </p>
                </div>

                <p
                  class="mt-2 text-xl font-bold"
                >
                  {{
                    formatPercent(
                      currentPolicy
                        .serviceRewardPercent
                    )
                  }}
                </p>
              </div>
            </div>

            <!-- LIMITS -->

            <div
              class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              <div
                class="rounded-xl border border-border p-4"
              >
                <p class="text-xs text-muted">
                  Максимум за покупку
                </p>

                <p
                  class="mt-1 font-semibold"
                >
                  {{
                    formatPoints(
                      currentPolicy.maxRewardPoints
                    )
                  }}
                </p>
              </div>

              <div
                class="rounded-xl border border-border p-4"
              >
                <p class="text-xs text-muted">
                  Оплата бонусами
                </p>

                <p
                  class="mt-1 font-semibold"
                >
                  до
                  {{
                    formatPercent(
                      currentPolicy
                        .maxRedeemPercent
                    )
                  }}
                </p>
              </div>

              <div
                class="rounded-xl border border-border p-4"
              >
                <p class="text-xs text-muted">
                  Мінімальна покупка
                </p>

                <p
                  class="mt-1 font-semibold"
                >
                  {{
                    formatMoney(
                      currentPolicy
                        .minPurchaseAmount
                    )
                  }}
                </p>
              </div>

              <div
                class="rounded-xl border border-border p-4"
              >
                <p class="text-xs text-muted">
                  Строк дії бонусів
                </p>

                <p
                  class="mt-1 font-semibold"
                >
                  {{
                    currentPolicy.expirationDays
                      ? `${currentPolicy.expirationDays} днів`
                      : 'Не згорають'
                  }}
                </p>
              </div>
            </div>

            <div
              class="border-t border-border pt-5"
            >
              <div
                class="flex items-center gap-2 text-sm"
              >
                <UIcon
                  :name="
                    currentPolicy
                      .rewardOnBonusPaidPart
                      ? 'i-lucide-circle-check'
                      : 'i-lucide-circle-x'
                  "
                  :class="
                    currentPolicy
                      .rewardOnBonusPaidPart
                      ? 'text-success'
                      : 'text-muted'
                  "
                />

                Нарахування на частину,
                оплачену бонусами
              </div>
            </div>

          </div>
        </UCard>

        <UCard v-else>
          <div class="py-8 text-center">
            <UIcon
              name="i-lucide-gift"
              class="mx-auto mb-3 size-8 text-muted"
            />

            <p class="font-medium">
              Активної політики немає
            </p>

            <p
              class="mt-1 text-sm text-muted"
            >
              Створіть першу бонусну політику
            </p>
          </div>
        </UCard>
      </div>

      <!-- HISTORY -->

      <div>
        <div class="mb-4">
          <h2
            class="text-lg font-semibold text-default"
          >
            Історія політик
          </h2>

          <p
            class="mt-1 text-sm text-muted"
          >
            Старі правила зберігаються
            для історії покупок
          </p>
        </div>

        <UCard>
          <div
            v-if="policies.length === 0"
            class="py-10 text-center text-muted"
          >
            Історії поки немає
          </div>

          <div
            v-else
            class="overflow-x-auto"
          >
            <table class="w-full text-sm">
              <thead>
                <tr
                  class="border-b border-border"
                >
                  <th
                    class="px-3 py-3 text-left"
                  >
                    Смартфони
                  </th>

                  <th
                    class="px-3 py-3 text-left"
                  >
                    Кнопкові
                  </th>

                  <th
                    class="px-3 py-3 text-left"
                  >
                    Аксесуари
                  </th>

                  <th
                    class="px-3 py-3 text-left"
                  >
                    Послуги
                  </th>

                  <th
                    class="px-3 py-3 text-left"
                  >
                    Ліміт
                  </th>

                  <th
                    class="px-3 py-3 text-left"
                  >
                    Списання
                  </th>

                  <th
                    class="px-3 py-3 text-left"
                  >
                    Початок
                  </th>

                  <th
                    class="px-3 py-3 text-left"
                  >
                    Статус
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="policy in policies"
                  :key="policy.id"
                  class="border-b border-border last:border-0"
                >
                  <td
                    class="px-3 py-3 font-semibold"
                  >
                    {{
                      formatPercent(
                        policy
                          .smartphoneRewardPercent
                      )
                    }}
                  </td>

                  <td class="px-3 py-3">
                    {{
                      formatPercent(
                        policy
                          .featurePhoneRewardPercent
                      )
                    }}
                  </td>

                  <td class="px-3 py-3">
                    {{
                      formatPercent(
                        policy
                          .accessoryRewardPercent
                      )
                    }}
                  </td>

                  <td class="px-3 py-3">
                    {{
                      formatPercent(
                        policy
                          .serviceRewardPercent
                      )
                    }}
                  </td>

                  <td class="px-3 py-3">
                    {{
                      policy.maxRewardPoints ??
                      '∞'
                    }}
                  </td>

                  <td class="px-3 py-3">
                    до
                    {{
                      formatPercent(
                        policy.maxRedeemPercent
                      )
                    }}
                  </td>

                  <td
                    class="px-3 py-3 text-muted"
                  >
                    {{
                      formatDateTime(
                        policy.validFrom
                      )
                    }}
                  </td>

                  <td class="px-3 py-3">
                    <UBadge
                      :color="
                        statusColor(policy)
                      "
                      variant="subtle"
                    >
                      {{
                        statusLabel(policy)
                      }}
                    </UBadge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </UCard>
      </div>

    </template>

    <!-- CREATE POLICY MODAL -->

    <UModal v-model:open="showCreateModal">
      <template #content>
        <UCard
          class="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <div
            class="mb-6 flex items-center justify-between"
          >
            <div>
              <h2 class="text-xl font-bold">
                Нова бонусна політика
              </h2>

              <p
                class="mt-1 text-sm text-muted"
              >
                Створюється нова версія правил
              </p>
            </div>

            <UButton
              icon="i-lucide-x"
              color="neutral"
              variant="ghost"
              @click="
                showCreateModal = false
              "
            />
          </div>

          <div class="space-y-6">

            <!-- REWARD RATES -->

            <div>
              <h3
                class="mb-3 font-semibold"
              >
                Нарахування бонусів
              </h3>

              <div
                class="grid gap-4 sm:grid-cols-2"
              >
                <UFormField
                  label="Смартфони, %"
                >
                  <UInput
                    v-model.number="
                      form.smartphoneRewardPercent
                    "
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    class="w-full"
                  />
                </UFormField>

                <UFormField
                  label="Кнопкові телефони, %"
                >
                  <UInput
                    v-model.number="
                      form.featurePhoneRewardPercent
                    "
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    class="w-full"
                  />
                </UFormField>

                <UFormField
                  label="Товари / аксесуари, %"
                >
                  <UInput
                    v-model.number="
                      form.accessoryRewardPercent
                    "
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    class="w-full"
                  />
                </UFormField>

                <UFormField
                  label="Послуги / ремонт, %"
                >
                  <UInput
                    v-model.number="
                      form.serviceRewardPercent
                    "
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    class="w-full"
                  />
                </UFormField>
              </div>
            </div>

            <UFormField
              label="Максимум бонусів за одну покупку"
            >
              <UInput
                v-model="
                  form.maxRewardPoints
                "
                type="number"
                min="1"
                placeholder="Без обмеження"
                class="w-full"
              />

              <template #description>
                Наприклад 300. Порожньо —
                без максимального ліміту.
              </template>
            </UFormField>

            <!-- REDEEM -->

            <div
              class="border-t border-border pt-5"
            >
              <h3
                class="mb-3 font-semibold"
              >
                Використання бонусів
              </h3>

              <div
                class="grid gap-4 sm:grid-cols-2"
              >
                <UFormField
                  label="Максимальна оплата бонусами, %"
                >
                  <UInput
                    v-model.number="
                      form.maxRedeemPercent
                    "
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    class="w-full"
                  />
                </UFormField>

                <UFormField
                  label="Мінімум бонусів для списання"
                >
                  <UInput
                    v-model="
                      form.minRedeemPoints
                    "
                    type="number"
                    min="0"
                    placeholder="Без обмеження"
                    class="w-full"
                  />
                </UFormField>
              </div>
            </div>

            <!-- OTHER -->

            <div
              class="grid gap-4 sm:grid-cols-2"
            >
              <UFormField
                label="Мінімальна сума покупки"
              >
                <UInput
                  v-model="
                    form.minPurchaseAmount
                  "
                  type="number"
                  min="0"
                  placeholder="Без обмеження"
                  class="w-full"
                />

                <template #description>
                  Порожньо — бонуси
                  нараховуються з будь-якої суми
                </template>
              </UFormField>

              <UFormField
                label="Активація бонусів через"
              >
                <UInput
                  v-model.number="
                    form.activationDelayDays
                  "
                  type="number"
                  min="0"
                  class="w-full"
                />

                <template #description>
                  Кількість днів. 0 — одразу.
                </template>
              </UFormField>
            </div>

            <UFormField
              label="Строк дії бонусів"
            >
              <UInput
                v-model="
                  form.expirationDays
                "
                type="number"
                min="1"
                placeholder="Не згорають"
                class="w-full"
              />

              <template #description>
                Порожньо — бонуси не згорають
              </template>
            </UFormField>

            <div
              class="rounded-xl border border-border p-4"
            >
              <UCheckbox
                v-model="
                  form.rewardOnBonusPaidPart
                "
                label="Нараховувати бонуси також на частину покупки, оплачену бонусами"
              />
            </div>

            <UFormField label="Початок дії">
              <UInput
                v-model="form.validFrom"
                type="datetime-local"
                class="w-full"
              />

              <template #description>
                Можна застосувати зараз або
                запланувати зміну на майбутнє
              </template>
            </UFormField>

            <div
              class="rounded-xl border border-warning/30 bg-warning/5 p-4"
            >
              <div class="flex gap-3">
                <UIcon
                  name="i-lucide-info"
                  class="mt-0.5 size-5 shrink-0 text-warning"
                />

                <p class="text-sm">
                  Нова політика не змінює вже
                  нараховані бонуси та старі
                  покупки. Попередня версія
                  залишиться в історії.
                </p>
              </div>
            </div>

            <div
              class="flex justify-end gap-2 pt-2"
            >
              <UButton
                color="neutral"
                variant="ghost"
                @click="
                  showCreateModal = false
                "
              >
                Скасувати
              </UButton>

              <UButton
                color="primary"
                icon="i-lucide-check"
                :loading="saving"
                @click="createPolicy"
              >
                Створити політику
              </UButton>
            </div>

          </div>
        </UCard>
      </template>
    </UModal>

  </div>
</template>