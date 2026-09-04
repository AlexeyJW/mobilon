<script setup lang="ts">
import type { Product } from '~/types'

interface CatalogCategory {
  id: number
  name: string
  slug: string
}

interface CatalogFilterOption {
  label: string
  value: string | number | boolean
}

interface CatalogFilter {
  id: number
  key: string
  name: string
  type: 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'SELECT' | 'MULTISELECT'
  unit: string | null
  options: CatalogFilterOption[]
}

interface CatalogFiltersResponse {
  category: CatalogCategory
  filters: CatalogFilter[]
}

const filtersOpen = ref(false)


const { data: productsData } =
  await useFetch<Product[]>('/api/products', {
    default: () => []
  })

const { data: categoriesData } =
  await useFetch<CatalogCategory[]>(
    '/api/catalog/categories',
    {
      default: () => []
    }
  )

const products = computed(() => {
  return productsData.value ?? []
})

const search = ref('')
const brand = ref('all')
const category = ref('all')

const catalogFilters = ref<CatalogFilter[]>([])

const selectedSpecifications =
  ref<Record<string, Array<string | number | boolean>>>({})

const selectedCategoryData = computed(() => {
  if (category.value === 'all') {
    return null
  }

  return (
    categoriesData.value.find(
      item => item.name === category.value
    ) ?? null
  )
})

watch(
  selectedCategoryData,

  async selectedCategory => {
    selectedSpecifications.value = {}
    catalogFilters.value = []

    if (!selectedCategory) {
      return
    }

    try {
      const response =
        await $fetch<CatalogFiltersResponse>(
          `/api/catalog/filters/${selectedCategory.id}`
        )

      catalogFilters.value = response.filters
    }
    catch (error) {
      console.error(
        'Помилка завантаження фільтрів:',
        error
      )
    }
  },

  {
    immediate: true
  }
)

const activeFiltersCount = computed(() => {
  return Object.values(
    selectedSpecifications.value
  ).reduce(
    (total, values) =>
      total + values.length,
    0
  )
})


function clearSpecifications() {
  selectedSpecifications.value = {}
}


function isSpecificationValueSelected(
  key: string,
  value: string | number | boolean
) {
  return (
    selectedSpecifications.value[key]?.includes(value) ??
    false
  )
}

function toggleSpecificationValue(
  key: string,
  value: string | number | boolean
) {
  const current =
    selectedSpecifications.value[key] ?? []

  if (current.includes(value)) {
    selectedSpecifications.value[key] =
      current.filter(item => item !== value)
  }
  else {
    selectedSpecifications.value[key] = [
      ...current,
      value
    ]
  }
}

/* ==============================
   BRANDS
============================== */

const brands = computed(() => {
  return [
    'all',
    ...new Set(
      products.value
        .map(product => product.brand)
        .filter(Boolean)
    )
  ]
})

/* ==============================
   CATEGORIES
============================== */

const categories = computed(() => {
  return [
    'all',
    ...categoriesData.value.map(
      category => category.name
    )
  ]
})

/* ==============================
   FILTER
============================== */

const filteredProducts = computed(() => {
  const q =
    search.value
      .trim()
      .toLowerCase()

  return products.value.filter(product => {

    if (
      q &&
      ![
        product.name,
        product.brand,
        product.category
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q)
    ) {
      return false
    }

    if (
      brand.value !== 'all' &&
      product.brand !== brand.value
    ) {
      return false
    }

    if (
      category.value !== 'all' &&
      product.category !== category.value
    ) {
      return false
    }

    return true
    for (
  const [key, selectedValues]
  of Object.entries(selectedSpecifications.value)
) {
  if (!selectedValues.length) {
    continue
  }

  const productSpecification =
    product.specifications?.find(
      (item: any) =>
        item.specification?.key === key
    )

  if (!productSpecification) {
    return false
  }

  let productValue:
    | string
    | number
    | boolean
    | null = null

  if (productSpecification.valueNumber !== null) {
    productValue =
      productSpecification.valueNumber
  }
  else if (
    productSpecification.valueBoolean !== null
  ) {
    productValue =
      productSpecification.valueBoolean
  }
  else if (productSpecification.option) {
    productValue =
      productSpecification.option.value
  }
  else if (
    productSpecification.valueText !== null
  ) {
    productValue =
      productSpecification.valueText
  }

  if (!selectedValues.includes(productValue as any)) {
    return false
  }
}
  })
})
</script>

<template>

<div class="space-y-8">

  <CatalogHero />

  <UInput
    v-model="search"
    icon="i-lucide-search"
    placeholder="Пошук товару..."
    size="lg"
  />

  <CatalogCategoryChips
    v-model="category"
    :categories="categories"
  />

  <CatalogBrandChips
    v-model="brand"
    :brands="brands"
  />
  <div
  v-if="
    category !== 'all' &&
    catalogFilters.length
  "
  class="flex items-center gap-2 lg:hidden"
>
  <UButton
    type="button"
    color="neutral"
    variant="soft"
    icon="i-lucide-sliders-horizontal"
    @click="filtersOpen = true"
  >
    Фільтри

    <UBadge
      v-if="activeFiltersCount"
      color="primary"
      variant="solid"
      size="xs"
    >
      {{ activeFiltersCount }}
    </UBadge>
  </UButton>

  <UButton
    v-if="activeFiltersCount"
    type="button"
    variant="ghost"
    color="neutral"
    @click="clearSpecifications"
  >
    Скинути
  </UButton>
</div>
 <div
  class="grid gap-6"
  :class="
    category !== 'all' &&
    catalogFilters.length
      ? 'lg:grid-cols-[260px_minmax(0,1fr)]'
      : 'grid-cols-1'
  "
>

  <!-- DESKTOP FILTERS -->

  <aside
    v-if="
      category !== 'all' &&
      catalogFilters.length
    "
    class="hidden lg:block"
  >
    <div
      class="
        sticky
        top-20
        rounded-xl
        border
        border-default
        bg-default
        p-4
      "
    >
      <CatalogFilters
        :filters="catalogFilters"
        :selected="selectedSpecifications"
        @toggle="toggleSpecificationValue"
        @clear="clearSpecifications"
      />
    </div>
  </aside>

  <!-- PRODUCTS -->

  <div class="min-w-0">

    <div
      class="
        mb-4
        flex
        items-center
        justify-between
      "
    >
      <div class="text-sm text-muted">
        Знайдено:
        <span class="font-medium text-default">
          {{ filteredProducts.length }}
        </span>
      </div>
    </div>

    <ProductGrid
      :products="filteredProducts"
    />

  </div>

</div>
<USlideover
  v-model:open="filtersOpen"
  title="Фільтри"
>
  <template #body>

    <CatalogFilters
      :filters="catalogFilters"
      :selected="selectedSpecifications"
      @toggle="toggleSpecificationValue"
      @clear="clearSpecifications"
    />

  </template>

  <template #footer>
    <div class="flex w-full gap-2">

      <UButton
        v-if="activeFiltersCount"
        type="button"
        color="neutral"
        variant="soft"
        class="flex-1 justify-center"
        @click="clearSpecifications"
      >
        Скинути
      </UButton>

      <UButton
        type="button"
        class="flex-1 justify-center"
        @click="filtersOpen = false"
      >
        Показати
        {{ filteredProducts.length }}
      </UButton>

    </div>
  </template>
</USlideover>
</div>

</template>