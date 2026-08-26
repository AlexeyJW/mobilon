<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

interface Service {
  id: number
  name: string
  description: string | null
  price: string | number
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
const categories = ref<{
  id: number
  name: string
}[]>([])
async function loadCategories() {
  try {
    const result = await $fetch<{
      success: boolean
      categories: {
        id: number
        name: string
      }[]
    }>('/api/admin/service-categories')

    categories.value = result.categories
  } catch (error) {
    console.error('Failed to load categories:', error)
  }
}
const services = ref<Service[]>([])
const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)

const showEditModal = ref(false)
const editingService = ref<Service | null>(null)
const editSaving = ref(false)

const editForm = reactive({
  name: '',
  description: '',
  category: '',
  price: '',
  active: true
})

onMounted(async () => {
  await Promise.all([
    loadServices(),
    loadCategories()
  ])
})
function openEditModal(service: Service) {
  editingService.value = service

  editForm.name = service.name
  editForm.description = service.description || ''
  editForm.categoryId = service.categoryId
  editForm.price = String(service.price)
  editForm.active = service.active

  showEditModal.value = true
}

async function updateService() {
  if (!editingService.value) return

  if (!editForm.name.trim()) {
    alert('Вкажіть назву послуги')
    return
  }

  const price = Number(editForm.price)

  if (!Number.isFinite(price) || price < 0) {
    alert('Вкажіть коректну ціну')
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
          category: editForm.category,
          price,
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

const form = reactive({
  name: '',
  description: '',
  categoryId: null as number | null,
  price: ''
})

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

function openCreateModal() {
  form.name = ''
  form.description = ''
  form.categoryId = null
  form.price = ''

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

  saving.value = true

  try {
    await $fetch('/api/admin/services', {
      method: 'POST',
      body: {
        name: form.name,
        description: form.description,
        categoryId: form.categoryId,
        price,
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

function formatPrice(price: string | number) {
  return `${Number(price).toLocaleString('uk-UA')} грн`
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('uk-UA')
}

onMounted(loadServices)
</script>

<template>
  <div class="space-y-6">

    <!-- Заголовок -->
    <div class="flex items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-default">
          Послуги
        </h1>

        <p class="text-sm text-muted mt-1">
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

    <!-- Таблиця -->
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

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border">
              <th class="text-left py-3 px-3">
                Послуга
              </th>

              <th class="text-left py-3 px-3">
                Категорія
              </th>

              <th class="text-left py-3 px-3">
                Ціна
              </th>

              <th class="text-left py-3 px-3">
                Статус
              </th>

              <th class="text-left py-3 px-3">
                Створено
              </th>

              <th class="text-right py-3 px-3">
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
              <td class="py-3 px-3">
                <div>
                  <p class="font-medium text-default">
                    {{ service.name }}
                  </p>

                  <p
                    v-if="service.description"
                    class="text-muted text-xs mt-1"
                  >
                    {{ service.description }}
                  </p>
                </div>
              </td>

              <td class="py-3 px-3 text-muted">
                {{ service.category || '—' }}
              </td>

              <td class="py-3 px-3 font-semibold">
                {{ formatPrice(service.price) }}
              </td>

              <td class="py-3 px-3">
                <UBadge
                  :color="service.active ? 'success' : 'error'"
                  variant="subtle"
                >
                  {{ service.active ? 'Активна' : 'Неактивна' }}
                </UBadge>
              </td>

              <td class="py-3 px-3 text-muted">
                {{ formatDate(service.createdAt) }}
              </td>

              <td class="py-3 px-3 text-right">
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

    <!-- Модалка створення -->
    <UModal v-model:open="showModal">
      <template #content>
       <UCard class="w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-xl font-bold">
                Нова послуга
              </h2>

              <p class="text-sm text-muted mt-1">
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
                :items="categories.map(category => ({
                  label: category.name,
                  value: category.id
                }))"
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

            <div class="flex justify-end gap-2 pt-4">
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
    <UModal v-model:open="showEditModal">
  <template #content>
   <UCard class="w-full max-w-md max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-xl font-bold">
            Редагувати послугу
          </h2>

          <p class="text-sm text-muted mt-1">
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
          <UInput
            v-model="editForm.category"
            placeholder="Перенесення даних"
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

        <UFormField label="Статус">
          <UCheckbox
            v-model="editForm.active"
            label="Послуга активна"
          />
        </UFormField>

        <div class="flex justify-end gap-2 pt-4">
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

  </div>
</template>