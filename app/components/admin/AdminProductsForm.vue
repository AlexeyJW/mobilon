<script setup lang="ts">
import slugify from 'slugify'

const form = defineModel<any>('form', {
  required: true
})

const props = defineProps<{
  submitting: boolean
  editingItem: any
}>()

const emit = defineEmits<{
  submit: []
  cancel: []
}>()

/* ==================================================
   TYPES
================================================== */

interface SpecificationOption {
  id: number
  label: string
  value: string
  sortOrder: number
}

interface Specification {
  id: number
  name: string
  key: string
  type: 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'SELECT' | 'MULTISELECT'
  unit: string | null
  sortOrder: number
  options: SpecificationOption[]
}

interface CategorySpecification {
  id: number
  categoryId: number
  specificationId: number
  required: boolean
  sortOrder: number
  specification: Specification
}

interface Brand {
  id: number
  name: string
  slug: string
}

interface Category {
  id: number
  name: string
  slug: string
  specifications: CategorySpecification[]
}

interface CatalogMeta {
  brands: Brand[]
  categories: Category[]
}

/* ==================================================
   CATALOG META
================================================== */

const {
  data: catalogMeta,
  error: catalogMetaError
} = await useFetch<CatalogMeta>(
  '/api/catalog/meta',
  {
    default: () => ({
      brands: [],
      categories: []
    })
  }
)

/* ==================================================
   BRANDS
================================================== */

const brands = computed(() => {
  return catalogMeta.value?.brands.map(brand => ({
    label: brand.name,
    value: brand.name
  })) || []
})

/* ==================================================
   CATEGORIES
================================================== */

const categories = computed(() => {
  return catalogMeta.value?.categories.map(category => ({
    label: category.name,
    value: category.name
  })) || []
})

/* ==================================================
   SELECTED CATEGORY
================================================== */

const selectedCategory = computed(() => {
  return catalogMeta.value?.categories.find(
    category => category.name === form.value.category
  ) || null
})

/* ==================================================
   CATEGORY SPECIFICATIONS
================================================== */

const categorySpecifications = computed(() => {
  return selectedCategory.value?.specifications
    ?.map(item => item.specification)
    ?.sort((a, b) => a.sortOrder - b.sortOrder) || []
})

/* ==================================================
   PRODUCT SPECIFICATIONS
================================================== */

const specifications = computed(() => {
  return form.value.specifications || {}
})

function getSpecificationValue(key: string) {
  return specifications.value[key]
}

function setSpecificationValue(
  key: string,
  value: any
) {
  if (!form.value.specifications) {
    form.value.specifications = {}
  }

  form.value.specifications[key] = value
}

function getSpecificationOptions(
  specification: Specification
) {
  return specification.options.map(option => ({
    label: option.label,
    value: option.value
  }))
}

/* ==================================================
   FINANCE
================================================== */

const profit = computed(() => {
  return Number(form.value.sellPrice || 0) -
    Number(form.value.buyPrice || 0)
})

const margin = computed(() => {
  const buy = Number(form.value.buyPrice || 0)
  const sell = Number(form.value.sellPrice || 0)

  if (!buy || !sell) return '0.0'

  return ((sell - buy) / buy * 100).toFixed(1)
})

function formatBoolean(value: any) {
  return value ? 'Так' : 'Ні'
}

function formatSpecificationValue(
  specification: Specification,
  value: any
) {
  if (
    value === undefined ||
    value === null ||
    value === ''
  ) {
    return null
  }

  if (specification.type === 'BOOLEAN') {
    return value ? 'Так' : 'Ні'
  }

  if (specification.type === 'SELECT') {
    const option = specification.options.find(
      item => item.value === value
    )

    return option?.label || String(value)
  }

  if (specification.type === 'MULTISELECT') {
    if (!Array.isArray(value)) {
      return String(value)
    }

    const labels = value.map(item => {
      const option = specification.options.find(
        option => option.value === item
      )

      return option?.label || item
    })

    return labels.join(', ')
  }

  if (specification.type === 'NUMBER') {
    return specification.unit
      ? `${value} ${specification.unit}`
      : String(value)
  }

  return String(value)
}

function getFilledSpecifications() {
  const specs = form.value.specifications || {}

  return categorySpecifications.value
    .map(specification => {
      const rawValue = specs[specification.key]

      const formattedValue =
        formatSpecificationValue(
          specification,
          rawValue
        )

      return {
        specification,
        rawValue,
        formattedValue
      }
    })
    .filter(
      item =>
        item.formattedValue !== null
    )
}

function generateShortDescription() {
  const filled = getFilledSpecifications()

  const parts = filled
    .slice(0, 6)
    .map(item => {
      const spec = item.specification
      const value = item.formattedValue

      if (!value) return null

      if (spec.type === 'BOOLEAN') {
        return item.rawValue
          ? spec.name
          : null
      }

      return value
    })
    .filter(Boolean)

  form.value.shortDescription = [
    form.value.name,
    ...parts
  ]
    .filter(Boolean)
    .join(', ')
}

function generateFullDescription() {
  const filled = getFilledSpecifications()

  const title =
    form.value.name ||
    'Товар'

  const categoryName =
    selectedCategory.value?.name ||
    'товар'

  const lines = filled.map(item => {
    return `• ${item.specification.name}: ${item.formattedValue}`
  })

  form.value.description =
`${title} — ${categoryName.toLowerCase()} з актуальними характеристиками для щоденного використання.

Основні характеристики:
${lines.join('\n')}`
}

function generateDescriptions() {
  generateShortDescription()
  generateFullDescription()
}

/* ==================================================
   SLUG
================================================== */

watch(
  () => form.value.name,
  (value) => {
    if (!value) return

    form.value.slug = slugify(value, {
      lower: true,
      strict: true,
      locale: 'uk'
    })
  }
)
</script>

<template>
<form
  class="flex flex-col"
  @submit.prevent="emit('submit')"
>

<div class="overflow-y-auto max-h-[70vh] space-y-6 p-6">

<!-- Фото -->

<UiSectionCard
  title="Фото"
  description="Головне фото товару"
>

<AdminImageUpload
  v-model:imageUrl="form.imageUrl"
  v-model:imageId="form.imageId"
/>

</UiSectionCard>

<!-- Основна інформація -->

<UiSectionCard
  title="Основна інформація"
>

<div class="grid md:grid-cols-2 gap-5">

<UFormField label="Назва товару">
<UInput
v-model="form.name"
placeholder="Samsung Galaxy A56"
/>
</UFormField>

<UFormField label="Slug">
<UInput
v-model="form.slug"
readonly
/>
</UFormField>

<UFormField label="Бренд">
<USelect
  v-model="form.brand"
  :items="brands"
  class="w-full min-w-[220px]"
/>
</UFormField>

<UFormField label="Категорія">
<USelect
v-model="form.category"
:items="categories"
 class="w-full min-w-[220px]" 
/>
</UFormField>

<UFormField label="Кількість">
<UInput
  v-model.number="form.quantity"
  type="number"
   class="w-24"
/>
</UFormField>

<UFormField label="Порядок">
<UInput
  v-model.number="form.sortOrder"
  type="number"
  class="w-24"
/>
</UFormField>

</div>

</UiSectionCard>
<!-- Характеристики -->

<UiSectionCard
  v-if="categorySpecifications.length"
  title="Характеристики"
  description="Характеристики автоматично визначаються категорією товару"
>

  <div class="grid md:grid-cols-2 gap-5">

    <template
      v-for="specification in categorySpecifications"
      :key="specification.id"
    >

      <!-- TEXT -->

      <UFormField
        v-if="specification.type === 'TEXT'"
        :label="specification.name"
      >

        <UInput
          :model-value="
            getSpecificationValue(specification.key) ?? ''
          "
          @update:model-value="
            setSpecificationValue(
              specification.key,
              $event
            )
          "
        />

      </UFormField>


      <!-- NUMBER -->

      <UFormField
        v-else-if="specification.type === 'NUMBER'"
        :label="specification.name"
      >

        <div class="flex items-center gap-2">

          <UInput
            type="number"
            :model-value="
              getSpecificationValue(specification.key) ?? ''
            "
            @update:model-value="
              setSpecificationValue(
                specification.key,
                $event
              )
            "
          />

          <span
            v-if="specification.unit"
            class="text-sm text-muted whitespace-nowrap"
          >
            {{ specification.unit }}
          </span>

        </div>

      </UFormField>


      <!-- SELECT -->

      <UFormField
        v-else-if="specification.type === 'SELECT'"
        :label="specification.name"
      >

        <USelect
          :model-value="
            getSpecificationValue(specification.key) ?? ''
          "
          :items="
            getSpecificationOptions(specification)
          "
          class="w-full"
          @update:model-value="
            setSpecificationValue(
              specification.key,
              $event
            )
          "
        />

      </UFormField>


      <!-- BOOLEAN -->

      <UFormField
        v-else-if="specification.type === 'BOOLEAN'"
        :label="specification.name"
      >

        <UCheckbox
          :model-value="
            getSpecificationValue(specification.key) ?? false
          "
          :label="specification.name"
          @update:model-value="
            setSpecificationValue(
              specification.key,
              $event
            )
          "
        />

      </UFormField>

    </template>

  </div>

</UiSectionCard>

<!-- Ціни -->

<UiSectionCard
  title="Ціни"
>


<div class="grid md:grid-cols-2 gap-5">

<UFormField label="Закупівельна ціна">
<UInput
v-model.number="form.buyPrice"
type="number"
/>
</UFormField>

<UFormField label="Ціна продажу">
<UInput
v-model.number="form.sellPrice"
type="number"
/>
</UFormField>

</div>

</UiSectionCard>

<!-- Опис -->

<UiSectionCard title="Опис">

  <div class="flex flex-wrap gap-2 mb-4">

   <UButton
  type="button"
  variant="soft"
  icon="i-lucide-wand-sparkles"
  @click="generateDescriptions"
>
  Сформувати опис
</UButton>
  </div>

  <UFormField label="Короткий опис">
    <UInput
      v-model="form.shortDescription"
    />
  </UFormField>

  <UFormField
    label="Повний опис"
    class="mt-5"
  >
    <UTextarea
      v-model="form.description"
      :rows="10"
    />
  </UFormField>

</UiSectionCard>

<!-- Налаштування -->

<UiSectionCard
title="Відображення"
>

<div class="grid md:grid-cols-2 gap-4">

<UCheckbox
v-model="form.active"
label="Активний"
/>

<UCheckbox
v-model="form.isFeatured"
label="На головній"
/>

<UCheckbox
v-model="form.isPopular"
label="Популярний"
/>

<UCheckbox
v-model="form.isNew"
label="Новинка"
/>

<UCheckbox
v-model="form.isSale"
label="Акція"
/>

</div>

</UiSectionCard>

<!-- Фінанси -->

<UiSectionCard
title="Фінанси"
>

<div class="grid grid-cols-2 gap-6">

<div>

<p class="text-sm text-muted">
Прибуток
</p>

<p
class="text-2xl font-bold text-green-600"
>

{{ profit }} грн

</p>

</div>

<div>

<p class="text-sm text-muted">
Маржа
</p>

<p
class="text-2xl font-bold text-green-600"
>

{{ margin }} %

</p>

</div>

</div>

</UiSectionCard>

</div>

<!-- Кнопки -->

<div class="border-t p-6 flex justify-end gap-3">

<UButton
color="neutral"
variant="soft"
@click="emit('cancel')"
>

Скасувати

</UButton>

<UButton
type="submit"
:loading="submitting"
icon="i-lucide-save"
>

{{ editingItem ? 'Зберегти' : 'Створити' }}

</UButton>

</div>

</form>
</template>