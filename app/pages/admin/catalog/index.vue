<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const toast = useToast()

const {
  data: categories,
  refresh: refreshCategories
} = await useFetch<any[]>(
  '/api/admin/catalog/categories',
  {
    default: () => []
  }
)

const {
  data: specifications,
  refresh: refreshSpecifications
} = await useFetch<any[]>(
  '/api/admin/catalog/specifications',
  {
    default: () => []
  }
)

const categoryModal = ref(false)
const specificationModal = ref(false)

const categorySaving = ref(false)
const specificationSaving = ref(false)

const categoryForm = ref({
  name: '',
  slug: '',
  parentId: null as number | null,
  sortOrder: 0,
  active: true
})

const specificationForm = ref({
  name: '',
  key: '',
  type: 'TEXT',
  unit: '',
  sortOrder: 0,
  active: true,
  options: [] as {
    label: string
    value: string
    sortOrder: number
  }[]
})

const specificationTypes = [
  {
    label: 'Текст',
    value: 'TEXT'
  },
  {
    label: 'Число',
    value: 'NUMBER'
  },
  {
    label: 'Так / Ні',
    value: 'BOOLEAN'
  },
  {
    label: 'Список',
    value: 'SELECT'
  },
  {
    label: 'Множинний список',
    value: 'MULTISELECT'
  }
]

const categoryOptions = computed(() => {
  return categories.value.map(category => ({
    label: category.name,
    value: category.id
  }))
})

const categorySpecificationsModal = ref(false)
const categorySpecificationsSaving = ref(false)

const selectedCategoryForSpecifications = ref<any>(null)

const categorySpecificationsForm = ref<
  {
    specificationId: number
    required: boolean
    sortOrder: number
  }[]
>([])
function openCategorySpecifications(category: any) {
  selectedCategoryForSpecifications.value = category

  categorySpecificationsForm.value =
    (category.specifications || []).map(
      (item: any) => ({
        specificationId: item.specificationId,
        required: item.required,
        sortOrder: item.sortOrder
      })
    )

  categorySpecificationsModal.value = true
}

function isSpecificationSelected(
  specificationId: number
) {
  return categorySpecificationsForm.value.some(
    item =>
      item.specificationId === specificationId
  )
}

function toggleSpecification(
  specificationId: number,
  checked: boolean
) {
  if (checked) {
    if (
      isSpecificationSelected(specificationId)
    ) {
      return
    }

    categorySpecificationsForm.value.push({
      specificationId,
      required: false,
      sortOrder:
        categorySpecificationsForm.value.length
    })

    return
  }

  categorySpecificationsForm.value =
    categorySpecificationsForm.value.filter(
      item =>
        item.specificationId !== specificationId
    )
}

function getCategorySpecification(
  specificationId: number
) {
  return categorySpecificationsForm.value.find(
    item =>
      item.specificationId === specificationId
  )
}

function setSpecificationRequired(
  specificationId: number,
  value: boolean
) {
  const item =
    getCategorySpecification(specificationId)

  if (!item) return

  item.required = value
}

async function saveCategorySpecifications() {
  if (!selectedCategoryForSpecifications.value) {
    return
  }

  try {
    categorySpecificationsSaving.value = true

    await $fetch(
      `/api/admin/catalog/categories/${selectedCategoryForSpecifications.value.id}/specifications`,
      {
        method: 'PUT',

        body: {
          specifications:
            categorySpecificationsForm.value
        }
      }
    )

    await refreshCategories()

    categorySpecificationsModal.value = false

    toast.add({
      title: 'Характеристики збережено',
      description:
        selectedCategoryForSpecifications.value.name,
      color: 'success',
      icon: 'i-lucide-check-circle'
    })
  }
  catch (error: any) {
    console.error(error)

    toast.add({
      title: 'Помилка',
      description:
        error?.data?.statusMessage ||
        'Не вдалося зберегти характеристики',
      color: 'error'
    })
  }
  finally {
    categorySpecificationsSaving.value = false
  }
}

function openCategoryModal() {
  categoryForm.value = {
    name: '',
    slug: '',
    parentId: null,
    sortOrder: 0,
    active: true
  }

  categoryModal.value = true
}

function openSpecificationModal() {
  specificationForm.value = {
    name: '',
    key: '',
    type: 'TEXT',
    unit: '',
    sortOrder: 0,
    active: true,
    options: []
  }

  specificationModal.value = true
}

function addSpecificationOption() {
  specificationForm.value.options.push({
    label: '',
    value: '',
    sortOrder:
      specificationForm.value.options.length
  })
}

function removeSpecificationOption(index: number) {
  specificationForm.value.options.splice(index, 1)
}

async function saveCategory() {
  try {
    categorySaving.value = true

    await $fetch(
      '/api/admin/catalog/categories',
      {
        method: 'POST',
        body: categoryForm.value
      }
    )

    await refreshCategories()

    categoryModal.value = false

    toast.add({
      title: 'Категорію створено',
      color: 'success',
      icon: 'i-lucide-check-circle'
    })
  }
  catch (error: any) {
    toast.add({
      title: 'Помилка',
      description:
        error?.data?.statusMessage ||
        'Не вдалося створити категорію',
      color: 'error'
    })
  }
  finally {
    categorySaving.value = false
  }
}

async function saveSpecification() {
  try {
    specificationSaving.value = true

    await $fetch(
      '/api/admin/catalog/specifications',
      {
        method: 'POST',
        body: specificationForm.value
      }
    )

    await refreshSpecifications()

    specificationModal.value = false

    toast.add({
      title: 'Характеристику створено',
      color: 'success',
      icon: 'i-lucide-check-circle'
    })
  }
  catch (error: any) {
    toast.add({
      title: 'Помилка',
      description:
        error?.data?.statusMessage ||
        'Не вдалося створити характеристику',
      color: 'error'
    })
  }
  finally {
    specificationSaving.value = false
  }
}
</script>

<template>
  <div class="space-y-6">

    <UiPageHeader
      title="Каталог"
      description="Категорії та характеристики товарів"
    />

    <!-- Категорії -->

    <UiSectionCard
      title="Категорії"
      description="Категорії товарів каталогу"
    >

      <template #actions>
        <UButton
          icon="i-lucide-plus"
          @click="openCategoryModal"
        >
          Нова категорія
        </UButton>
      </template>

      <div class="space-y-3">

        <div
          v-for="category in categories"
          :key="category.id"
          class="flex items-center justify-between border rounded-xl p-4"
        >

          <div>

            <div class="font-semibold">
              {{ category.name }}
            </div>

            <div class="text-sm text-muted">
              {{ category.slug }}
            </div>

            <div class="text-xs text-muted mt-1">
              Товарів:
              {{ category._count?.products || 0 }}
            </div>

          </div>

          <div class="flex items-center gap-2">
            <UButton
            size="sm"
            variant="soft"
            icon="i-lucide-list-checks"
            @click="
                openCategorySpecifications(category)
            "
            >
            Характеристики
            ({{ category.specifications?.length || 0 }})
            </UButton>
            <UBadge
              :color="
                category.active
                  ? 'success'
                  : 'neutral'
              "
            >
              {{
                category.active
                  ? 'Активна'
                  : 'Вимкнена'
              }}
            </UBadge>

          </div>

        </div>

      </div>

    </UiSectionCard>

    <!-- Характеристики -->

    <UiSectionCard
      title="Характеристики"
      description="Характеристики, які використовуються у товарах"
    >

      <template #actions>
        <UButton
          icon="i-lucide-plus"
          @click="openSpecificationModal"
        >
          Нова характеристика
        </UButton>
      </template>

      <div class="space-y-3">

        <div
          v-for="spec in specifications"
          :key="spec.id"
          class="border rounded-xl p-4"
        >

          <div
            class="flex items-start justify-between gap-4"
          >

            <div>

              <div class="font-semibold">
                {{ spec.name }}
              </div>

              <div class="text-sm text-muted">
                key:
                {{ spec.key }}
              </div>

              <div class="text-sm text-muted mt-1">
                Тип:
                {{ spec.type }}

                <span v-if="spec.unit">
                  · {{ spec.unit }}
                </span>
              </div>

            </div>

            <UBadge
              :color="
                spec.active
                  ? 'success'
                  : 'neutral'
              "
            >
              {{
                spec.active
                  ? 'Активна'
                  : 'Вимкнена'
              }}
            </UBadge>

          </div>

          <div
            v-if="spec.options?.length"
            class="flex flex-wrap gap-2 mt-3"
          >

            <UBadge
              v-for="option in spec.options"
              :key="option.id"
              color="neutral"
              variant="soft"
            >
              {{ option.label }}
            </UBadge>

          </div>

        </div>

      </div>

    </UiSectionCard>

    <!-- Modal Category -->

    <UModal v-model:open="categoryModal">

      <template #header>
        <h2 class="text-xl font-semibold">
          Нова категорія
        </h2>
      </template>

      <template #body>

        <div class="space-y-5">

          <UFormField label="Назва">
            <UInput
              v-model="categoryForm.name"
              placeholder="Power Bank"
            />
          </UFormField>

          <UFormField label="Slug">
            <UInput
              v-model="categoryForm.slug"
              placeholder="power-bank"
            />
          </UFormField>

          <UFormField
            label="Батьківська категорія"
          >

            <USelect
              v-model="categoryForm.parentId"
              :items="categoryOptions"
              placeholder="Без батьківської категорії"
              class="w-full"
            />

          </UFormField>

          <UFormField label="Порядок">
            <UInput
              v-model.number="
                categoryForm.sortOrder
              "
              type="number"
            />
          </UFormField>

          <UCheckbox
            v-model="categoryForm.active"
            label="Активна"
          />

        </div>

      </template>

      <template #footer>

        <div class="flex justify-end gap-3">

          <UButton
            color="neutral"
            variant="soft"
            @click="categoryModal = false"
          >
            Скасувати
          </UButton>

          <UButton
            :loading="categorySaving"
            icon="i-lucide-save"
            @click="saveCategory"
          >
            Створити
          </UButton>

        </div>

      </template>

    </UModal>

    <!-- Modal Specification -->

    <UModal
      v-model:open="specificationModal"
      :ui="{
        content:
          'max-w-2xl max-h-[90vh] overflow-y-auto'
      }"
    >

      <template #header>
        <h2 class="text-xl font-semibold">
          Нова характеристика
        </h2>
      </template>

      <template #body>

        <div class="space-y-5">

          <UFormField label="Назва">
            <UInput
              v-model="specificationForm.name"
              placeholder="Потужність зарядки"
            />
          </UFormField>

          <UFormField label="Key">
            <UInput
              v-model="specificationForm.key"
              placeholder="charging_power"
            />
          </UFormField>

          <UFormField label="Тип">
            <USelect
              v-model="specificationForm.type"
              :items="specificationTypes"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Одиниця">
            <UInput
              v-model="specificationForm.unit"
              placeholder="Вт"
            />
          </UFormField>

          <UFormField label="Порядок">
            <UInput
              v-model.number="
                specificationForm.sortOrder
              "
              type="number"
            />
          </UFormField>

          <UCheckbox
            v-model="specificationForm.active"
            label="Активна"
          />

          <!-- Options -->

          <div
            v-if="
              specificationForm.type ===
                'SELECT' ||
              specificationForm.type ===
                'MULTISELECT'
            "
            class="space-y-3"
          >

            <div
              class="flex items-center justify-between"
            >

              <h3 class="font-semibold">
                Варіанти
              </h3>

              <UButton
                size="sm"
                variant="soft"
                icon="i-lucide-plus"
                @click="addSpecificationOption"
              >
                Додати
              </UButton>

            </div>

            <div
              v-for="
                (option, index)
                in specificationForm.options
              "
              :key="index"
              class="grid grid-cols-[1fr_1fr_auto] gap-2"
            >

              <UInput
                v-model="option.label"
                placeholder="Назва"
              />

              <UInput
                v-model="option.value"
                placeholder="value"
              />

              <UButton
                icon="i-lucide-trash"
                color="error"
                variant="soft"
                @click="
                  removeSpecificationOption(index)
                "
              />

            </div>

          </div>

        </div>

      </template>

      <template #footer>

        <div class="flex justify-end gap-3">

          <UButton
            color="neutral"
            variant="soft"
            @click="
              specificationModal = false
            "
          >
            Скасувати
          </UButton>

          <UButton
            :loading="specificationSaving"
            icon="i-lucide-save"
            @click="saveSpecification"
          >
            Створити
          </UButton>

        </div>

      </template>

    </UModal>
   <UModal
  v-model:open="categorySpecificationsModal"
  :ui="{
    content: 'max-w-2xl max-h-[90vh] overflow-y-auto'
  }"
>
  <template #header>

    <div>
      <h2 class="text-xl font-semibold">
        Характеристики категорії
      </h2>

      <p class="text-sm text-muted mt-1">
        {{
          selectedCategoryForSpecifications?.name
        }}
      </p>
    </div>

  </template>

  <template #body>

    <div class="space-y-3">

      <div
        v-for="spec in specifications"
        :key="spec.id"
        class="border rounded-xl p-4"
      >

        <div
          class="flex items-start justify-between gap-4"
        >

          <div class="flex items-start gap-3">

            <UCheckbox
              :model-value="
                isSpecificationSelected(spec.id)
              "
              @update:model-value="
                toggleSpecification(
                  spec.id,
                  Boolean($event)
                )
              "
            />

            <div>

              <div class="font-medium">
                {{ spec.name }}
              </div>

              <div class="text-xs text-muted">
                {{ spec.key }}
                ·
                {{ spec.type }}

                <span v-if="spec.unit">
                  · {{ spec.unit }}
                </span>
              </div>

            </div>

          </div>

          <UCheckbox
            v-if="
              isSpecificationSelected(spec.id)
            "
            :model-value="
              getCategorySpecification(spec.id)
                ?.required || false
            "
            label="Обов'язкова"
            @update:model-value="
              setSpecificationRequired(
                spec.id,
                Boolean($event)
              )
            "
          />

        </div>

      </div>

      <div
        v-if="!specifications.length"
        class="text-center text-muted py-8"
      >
        Характеристик ще немає
      </div>

    </div>

  </template>

  <template #footer>

    <div class="flex justify-end gap-3 w-full">

      <UButton
        color="neutral"
        variant="soft"
        @click="
          categorySpecificationsModal = false
        "
      >
        Скасувати
      </UButton>

      <UButton
        icon="i-lucide-save"
        :loading="
          categorySpecificationsSaving
        "
        @click="saveCategorySpecifications"
      >
        Зберегти
      </UButton>

    </div>

  </template>
</UModal>
  </div>
</template>