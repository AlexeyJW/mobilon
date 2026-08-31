
<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

/* ==================================================
   TYPES
================================================== */

interface Category {
  id: number
  name: string
  sortOrder: number
  active: boolean
  createdAt: string
  updatedAt: string
}

interface Service {
  id: number
  name: string
  description: string | null
  price: string | number
  priceFrom: boolean
  sortOrder: number
  category: string | null
  categoryId: number | null
  categoryRef?: {
    id: number
    name: string
  } | null
  active: boolean
  createdAt: string
  updatedAt: string
}

/* ==================================================
   STATE
================================================== */

const categories = ref<Category[]>([])
const services = ref<Service[]>([])

const loading = ref(false)
const saving = ref(false)
const editSaving = ref(false)

const categorySaving = ref(false)
const categoryEditSaving = ref(false)

const showModal = ref(false)
const showEditModal = ref(false)

const showCategoryModal = ref(false)
const showCategoryEditModal = ref(false)

const editingService = ref<Service | null>(null)
const editingCategory = ref<Category | null>(null)

/* ==================================================
   SERVICE FORMS
================================================== */

const form = reactive({
  name: '',
  description: '',
  categoryId: null as number | null,
  price: '',
  priceFrom: false,
  sortOrder: 0
})

const editForm = reactive({
  name: '',
  description: '',
  categoryId: null as number | null,
  price: '',
  priceFrom: false,
  sortOrder: 0,
  active: true
})

/* ==================================================
   CATEGORY FORMS
================================================== */

const categoryForm = reactive({
  name: '',
  sortOrder: 0,
  active: true
})

const categoryEditForm = reactive({
  name: '',
  sortOrder: 0,
  active: true
})

/* ==================================================
   CATEGORY SELECT
================================================== */

const categoryItems = computed(() =>
  categories.value
    .filter(category => category.active)
    .map(category => ({
      label: category.name,
      value: category.id
    }))
)

/* ==================================================
   LOAD CATEGORIES
================================================== */

async function loadCategories() {
  try {
    const result = await $fetch<{
      success: boolean
      categories: Category[]
    }>('/api/admin/service-categories')

    categories.value = result.categories
  } catch (error) {
    console.error('Failed to load categories:', error)
  }
}

/* ==================================================
   LOAD SERVICES
================================================== */

async function loadServices() {
  loading.value = true

  try {
    const result = await $fetch<{
      success: boolean
      services: Service[]
    }>('/api/admin/services')

    services.value = result.services
  } catch (error) {
    console.error('Failed to load services:', error)
  } finally {
    loading.value = false
  }
}

/* ==================================================
   INITIAL LOAD
================================================== */

onMounted(async () => {
  await Promise.all([
    loadServices(),
    loadCategories()
  ])
})

/* ==================================================
   CREATE SERVICE
================================================== */

function openCreateModal() {
  form.name = ''
  form.description = ''
  form.categoryId = null
  form.price = ''
  form.priceFrom = false
  form.sortOrder = 0

  showModal.value = true
}

async function createService() {
  if (!form.name.trim()) {
    alert('Вкажіть назву послуги')
    return
  }

  const price = Number(form.price)

  if (!Number.isFinite(price) || price < 0) {
    alert('Вкажіть коректну ціну')
    return
  }

  if (
    !Number.isInteger(form.sortOrder) ||
    form.sortOrder < 0
  ) {
    alert('Вкажіть коректний порядок')
    return
  }

  saving.value = true

  try {
    await $fetch('/api/admin/services', {
      method: 'POST',
      body: {
        name: form.name,
        description: form.description,
        categoryId: form.categoryId,
        price,
        priceFrom: form.priceFrom,
        sortOrder: form.sortOrder,
        active: true
      }
    })

    showModal.value = false

    await loadServices()
  } catch (error: any) {
    console.error('Failed to create service:', error)

    alert(
      error?.data?.statusMessage ||
      'Не вдалося створити послугу'
    )
  } finally {
    saving.value = false
  }
}

/* ==================================================
   EDIT SERVICE
================================================== */

function openEditModal(service: Service) {
  editingService.value = service

  editForm.name = service.name
  editForm.description = service.description || ''
  editForm.categoryId = service.categoryId
  editForm.price = String(service.price)
  editForm.priceFrom = service.priceFrom
  editForm.sortOrder = service.sortOrder
  editForm.active = service.active

  showEditModal.value = true
}

async function updateService() {
  if (!editingService.value) {
    return
  }

  if (!editForm.name.trim()) {
    alert('Вкажіть назву послуги')
    return
  }

  const price = Number(editForm.price)

  if (!Number.isFinite(price) || price < 0) {
    alert('Вкажіть коректну ціну')
    return
  }

  if (
    !Number.isInteger(editForm.sortOrder) ||
    editForm.sortOrder < 0
  ) {
    alert('Вкажіть коректний порядок')
    return
  }

  editSaving.value = true

  try {
    await $fetch(
      `/api/admin/services/${editingService.value.id}`,
      {
        method: 'PUT',

        body: {
          name: editForm.name,
          description: editForm.description,
          categoryId: editForm.categoryId,
          price,
          priceFrom: editForm.priceFrom,
          sortOrder: editForm.sortOrder,
          active: editForm.active
        }
      }
    )

    showEditModal.value = false

    await loadServices()
  } catch (error: any) {
    console.error('Failed to update service:', error)

    alert(
      error?.data?.statusMessage ||
      'Не вдалося оновити послугу'
    )
  } finally {
    editSaving.value = false
  }
}

/* ==================================================
   CREATE CATEGORY
================================================== */

function openCreateCategoryModal() {
  categoryForm.name = ''

  /*
   * Автоматично пропонуємо наступний порядок.
   */
  const maxSortOrder = categories.value.length
    ? Math.max(
        ...categories.value.map(category => category.sortOrder)
      )
    : -1

  categoryForm.sortOrder = maxSortOrder + 1
  categoryForm.active = true

  showCategoryModal.value = true
}

async function createCategory() {
  if (!categoryForm.name.trim()) {
    alert('Вкажіть назву категорії')
    return
  }

  if (
    !Number.isInteger(categoryForm.sortOrder) ||
    categoryForm.sortOrder < 0
  ) {
    alert('Вкажіть коректний порядок')
    return
  }

  categorySaving.value = true

  try {
    await $fetch('/api/admin/service-categories', {
      method: 'POST',

      body: {
        name: categoryForm.name,
        sortOrder: categoryForm.sortOrder,
        active: categoryForm.active
      }
    })

    showCategoryModal.value = false

    await loadCategories()
  } catch (error: any) {
    console.error(
      'Failed to create category:',
      error
    )

    alert(
      error?.data?.statusMessage ||
      'Не вдалося створити категорію'
    )
  } finally {
    categorySaving.value = false
  }
}

/* ==================================================
   EDIT CATEGORY
================================================== */

function openEditCategoryModal(category: Category) {
  editingCategory.value = category

  categoryEditForm.name = category.name
  categoryEditForm.sortOrder = category.sortOrder
  categoryEditForm.active = category.active

  showCategoryEditModal.value = true
}

async function updateCategory() {
  if (!editingCategory.value) {
    return
  }

  if (!categoryEditForm.name.trim()) {
    alert('Вкажіть назву категорії')
    return
  }

  if (
    !Number.isInteger(categoryEditForm.sortOrder) ||
    categoryEditForm.sortOrder < 0
  ) {
    alert('Вкажіть коректний порядок')
    return
  }

  categoryEditSaving.value = true

  try {
    await $fetch(
      `/api/admin/service-categories/${editingCategory.value.id}`,
      {
        method: 'PUT',

        body: {
          name: categoryEditForm.name,
          sortOrder: categoryEditForm.sortOrder,
          active: categoryEditForm.active
        }
      }
    )

    showCategoryEditModal.value = false

    await Promise.all([
      loadCategories(),
      loadServices()
    ])
  } catch (error: any) {
    console.error(
      'Failed to update category:',
      error
    )

    alert(
      error?.data?.statusMessage ||
      'Не вдалося оновити категорію'
    )
  } finally {
    categoryEditSaving.value = false
  }
}

/* ==================================================
   HELPERS
================================================== */

function formatPrice(
  price: string | number,
  priceFrom = false
) {
  const formatted =
    Number(price).toLocaleString('uk-UA')

  return priceFrom
    ? `від ${formatted} грн`
    : `${formatted} грн`
}

function formatDate(date: string) {
  return new Date(date)
    .toLocaleDateString('uk-UA')
}
</script>

<template>
  <div class="space-y-8">

    <!-- ==================================================
         SERVICES HEADER
    ================================================== -->

    <div class="flex items-center justify-between gap-4">

      <div>
        <h1 class="text-2xl font-bold text-default">
          Послуги
        </h1>

        <p class="mt-1 text-sm text-muted">
          Каталог послуг та їх ціни
        </p>
      </div>

      <UButton
        icon="i-lucide-plus"
        color="primary"
        @click="openCreateModal"
      >
        Додати послугу
      </UButton>

    </div>

    <!-- ==================================================
         SERVICES TABLE
    ================================================== -->

    <UCard>

      <div
        v-if="loading"
        class="py-10 text-center text-muted"
      >
        Завантаження...
      </div>

      <div
        v-else-if="services.length === 0"
        class="py-10 text-center text-muted"
      >
        Послуг поки немає
      </div>

      <div
        v-else
        class="overflow-x-auto"
      >

        <table class="w-full text-sm">

          <thead>
            <tr class="border-b border-border">

              <th class="px-3 py-3 text-left">
                Послуга
              </th>

              <th class="px-3 py-3 text-left">
                Категорія
              </th>

              <th class="px-3 py-3 text-left">
                Ціна
              </th>

              <th class="px-3 py-3 text-left">
                Порядок
              </th>

              <th class="px-3 py-3 text-left">
                Статус
              </th>

              <th class="px-3 py-3 text-left">
                Створено
              </th>

              <th class="px-3 py-3 text-right">
                Дії
              </th>

            </tr>
          </thead>

          <tbody>

            <tr
              v-for="service in services"
              :key="service.id"
              class="border-b border-border last:border-0"
            >

              <td class="px-3 py-3">

                <p class="font-medium text-default">
                  {{ service.name }}
                </p>

                <p
                  v-if="service.description"
                  class="mt-1 text-xs text-muted"
                >
                  {{ service.description }}
                </p>

              </td>

              <td class="px-3 py-3 text-muted">

                {{
                  service.categoryRef?.name ||
                  service.category ||
                  '—'
                }}

              </td>

              <td class="px-3 py-3 font-semibold">

                {{
                  formatPrice(
                    service.price,
                    service.priceFrom
                  )
                }}

              </td>

              <td class="px-3 py-3 text-muted">

                {{ service.sortOrder }}

              </td>

              <td class="px-3 py-3">

                <UBadge
                  :color="
                    service.active
                      ? 'success'
                      : 'error'
                  "
                  variant="subtle"
                >
                  {{
                    service.active
                      ? 'Активна'
                      : 'Неактивна'
                  }}
                </UBadge>

              </td>

              <td class="px-3 py-3 text-muted">

                {{ formatDate(service.createdAt) }}

              </td>

              <td class="px-3 py-3 text-right">

                <UButton
                  icon="i-lucide-pencil"
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  title="Редагувати"
                  @click="openEditModal(service)"
                />

              </td>

            </tr>

          </tbody>

        </table>

      </div>

    </UCard>

    <!-- ==================================================
         CATEGORIES HEADER
    ================================================== -->

    <div class="flex items-center justify-between gap-4 pt-4">

      <div>
        <h2 class="text-xl font-bold text-default">
          Категорії прайсу
        </h2>

        <p class="mt-1 text-sm text-muted">
          Визначте порядок категорій у прайсі
        </p>
      </div>

      <UButton
        icon="i-lucide-plus"
        color="primary"
        variant="soft"
        @click="openCreateCategoryModal"
      >
        Додати категорію
      </UButton>

    </div>

    <!-- ==================================================
         CATEGORIES TABLE
    ================================================== -->

    <UCard>

      <div
        v-if="categories.length === 0"
        class="py-10 text-center text-muted"
      >
        Категорій поки немає
      </div>

      <div
        v-else
        class="overflow-x-auto"
      >

        <table class="w-full text-sm">

          <thead>

            <tr class="border-b border-border">

              <th class="w-20 px-3 py-3 text-center">
                Порядок
              </th>

              <th class="px-3 py-3 text-left">
                Категорія
              </th>

              <th class="px-3 py-3 text-left">
                Статус
              </th>

              <th class="px-3 py-3 text-left">
                Створено
              </th>

              <th class="px-3 py-3 text-right">
                Дії
              </th>

            </tr>

          </thead>

          <tbody>

            <tr
              v-for="category in categories"
              :key="category.id"
              class="border-b border-border last:border-0"
            >

              <td class="px-3 py-3 text-center">

                <UBadge
                  color="primary"
                  variant="soft"
                >
                  {{ category.sortOrder }}
                </UBadge>

              </td>

              <td class="px-3 py-3">

                <p class="font-medium text-default">
                  {{ category.name }}
                </p>

              </td>

              <td class="px-3 py-3">

                <UBadge
                  :color="
                    category.active
                      ? 'success'
                      : 'error'
                  "
                  variant="subtle"
                >
                  {{
                    category.active
                      ? 'Активна'
                      : 'Неактивна'
                  }}
                </UBadge>

              </td>

              <td class="px-3 py-3 text-muted">

                {{ formatDate(category.createdAt) }}

              </td>

              <td class="px-3 py-3 text-right">

                <UButton
                  icon="i-lucide-pencil"
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  title="Редагувати категорію"
                  @click="
                    openEditCategoryModal(category)
                  "
                />

              </td>

            </tr>

          </tbody>

        </table>

      </div>

    </UCard>

    <!-- ==================================================
         CREATE SERVICE MODAL
    ================================================== -->

    <UModal v-model:open="showModal">

      <template #content>

        <UCard
          class="w-full max-w-md max-h-[90vh] overflow-y-auto"
        >

          <div
            class="mb-6 flex items-center justify-between"
          >

            <div>

              <h2 class="text-xl font-bold">
                Нова послуга
              </h2>

              <p class="mt-1 text-sm text-muted">
                Додайте послугу до каталогу
              </p>

            </div>

            <UButton
              icon="i-lucide-x"
              color="neutral"
              variant="ghost"
              @click="showModal = false"
            />

          </div>

          <div class="space-y-4">

            <UFormField label="Назва">

              <UInput
                v-model="form.name"
                placeholder="Перенесення даних"
                class="w-full"
              />

            </UFormField>

            <UFormField label="Опис">

              <UTextarea
                v-model="form.description"
                placeholder="Короткий опис послуги"
                class="w-full"
              />

            </UFormField>

            <UFormField label="Категорія">

              <USelect
                v-model="form.categoryId"
                :items="categoryItems"
                placeholder="Оберіть категорію"
                class="w-full"
              />

            </UFormField>

            <UFormField label="Ціна">

              <UInput
                v-model="form.price"
                type="number"
                min="0"
                placeholder="500"
                class="w-full"
              />

            </UFormField>

            <UCheckbox
              v-model="form.priceFrom"
              label="Показувати «від»"
            />

            <UFormField label="Порядок">

              <UInput
                v-model.number="form.sortOrder"
                type="number"
                min="0"
                placeholder="0"
                class="w-full"
              />

              <template #description>
                Менше число — вище у категорії
              </template>

            </UFormField>

            <div
              class="flex justify-end gap-2 pt-4"
            >

              <UButton
                color="neutral"
                variant="ghost"
                @click="showModal = false"
              >
                Скасувати
              </UButton>

              <UButton
                color="primary"
                :loading="saving"
                @click="createService"
              >
                Створити
              </UButton>

            </div>

          </div>

        </UCard>

      </template>

    </UModal>

    <!-- ==================================================
         EDIT SERVICE MODAL
    ================================================== -->

    <UModal v-model:open="showEditModal">

      <template #content>

        <UCard
          class="w-full max-w-md max-h-[90vh] overflow-y-auto"
        >

          <div
            class="mb-6 flex items-center justify-between"
          >

            <div>

              <h2 class="text-xl font-bold">
                Редагувати послугу
              </h2>

              <p class="mt-1 text-sm text-muted">
                Змініть інформацію про послугу
              </p>

            </div>

            <UButton
              icon="i-lucide-x"
              color="neutral"
              variant="ghost"
              @click="showEditModal = false"
            />

          </div>

          <div class="space-y-4">

            <UFormField label="Назва">

              <UInput
                v-model="editForm.name"
                placeholder="Перенесення даних"
                class="w-full"
              />

            </UFormField>

            <UFormField label="Опис">

              <UTextarea
                v-model="editForm.description"
                placeholder="Короткий опис послуги"
                class="w-full"
              />

            </UFormField>

            <UFormField label="Категорія">

              <USelect
                v-model="editForm.categoryId"
                :items="categoryItems"
                placeholder="Оберіть категорію"
                class="w-full"
              />

            </UFormField>

            <UFormField label="Ціна">

              <UInput
                v-model="editForm.price"
                type="number"
                min="0"
                class="w-full"
              />

            </UFormField>

            <UCheckbox
              v-model="editForm.priceFrom"
              label="Показувати «від»"
            />

            <UFormField label="Порядок">

              <UInput
                v-model.number="editForm.sortOrder"
                type="number"
                min="0"
                class="w-full"
              />

              <template #description>
                Менше число — вище у категорії
              </template>

            </UFormField>

            <UFormField label="Статус">

              <UCheckbox
                v-model="editForm.active"
                label="Послуга активна"
              />

            </UFormField>

            <div
              class="flex justify-end gap-2 pt-4"
            >

              <UButton
                color="neutral"
                variant="ghost"
                @click="showEditModal = false"
              >
                Скасувати
              </UButton>

              <UButton
                color="primary"
                :loading="editSaving"
                @click="updateService"
              >
                Зберегти
              </UButton>

            </div>

          </div>

        </UCard>

      </template>

    </UModal>

    <!-- ==================================================
         CREATE CATEGORY MODAL
    ================================================== -->

    <UModal v-model:open="showCategoryModal">

      <template #content>

        <UCard
          class="w-full max-w-md max-h-[90vh] overflow-y-auto"
        >

          <div
            class="mb-6 flex items-center justify-between"
          >

            <div>

              <h2 class="text-xl font-bold">
                Нова категорія
              </h2>

              <p class="mt-1 text-sm text-muted">
                Додайте категорію до прайсу
              </p>

            </div>

            <UButton
              icon="i-lucide-x"
              color="neutral"
              variant="ghost"
              @click="
                showCategoryModal = false
              "
            />

          </div>

          <div class="space-y-4">

            <UFormField label="Назва">

              <UInput
                v-model="categoryForm.name"
                placeholder="Ремонт"
                class="w-full"
              />

            </UFormField>

            <UFormField label="Порядок">

              <UInput
                v-model.number="categoryForm.sortOrder"
                type="number"
                min="0"
                placeholder="0"
                class="w-full"
              />

              <template #description>
                Менше число — вище категорія у прайсі
              </template>

            </UFormField>

            <UFormField label="Статус">

              <UCheckbox
                v-model="categoryForm.active"
                label="Категорія активна"
              />

            </UFormField>

            <div
              class="flex justify-end gap-2 pt-4"
            >

              <UButton
                color="neutral"
                variant="ghost"
                @click="
                  showCategoryModal = false
                "
              >
                Скасувати
              </UButton>

              <UButton
                color="primary"
                :loading="categorySaving"
                @click="createCategory"
              >
                Створити
              </UButton>

            </div>

          </div>

        </UCard>

      </template>

    </UModal>

    <!-- ==================================================
         EDIT CATEGORY MODAL
    ================================================== -->

    <UModal v-model:open="showCategoryEditModal">

      <template #content>

        <UCard
          class="w-full max-w-md max-h-[90vh] overflow-y-auto"
        >

          <div
            class="mb-6 flex items-center justify-between"
          >

            <div>

              <h2 class="text-xl font-bold">
                Редагувати категорію
              </h2>

              <p class="mt-1 text-sm text-muted">
                Змініть назву, порядок або статус
              </p>

            </div>

            <UButton
              icon="i-lucide-x"
              color="neutral"
              variant="ghost"
              @click="
                showCategoryEditModal = false
              "
            />

          </div>

          <div class="space-y-4">

            <UFormField label="Назва">

              <UInput
                v-model="categoryEditForm.name"
                placeholder="Ремонт"
                class="w-full"
              />

            </UFormField>

            <UFormField label="Порядок">

              <UInput
                v-model.number="
                  categoryEditForm.sortOrder
                "
                type="number"
                min="0"
                class="w-full"
              />

              <template #description>
                Менше число — вище категорія у прайсі
              </template>

            </UFormField>

            <UFormField label="Статус">

              <UCheckbox
                v-model="categoryEditForm.active"
                label="Категорія активна"
              />

            </UFormField>

            <div
              class="flex justify-end gap-2 pt-4"
            >

              <UButton
                color="neutral"
                variant="ghost"
                @click="
                  showCategoryEditModal = false
                "
              >
                Скасувати
              </UButton>

              <UButton
                color="primary"
                :loading="categoryEditSaving"
                @click="updateCategory"
              >
                Зберегти
              </UButton>

            </div>

          </div>

        </UCard>

      </template>

    </UModal>

  </div>
</template>

