<template>
  <div class="space-y-6">

    <UiPageHeader
      title="Товари"
      description="Каталог товарів"
    />
<UButton
  icon="i-lucide-plus"
  color="primary"
  @click="openCreateModal"
>
  Новий товар
</UButton>
<UCard class="overflow-visible">
<div class="mb-4 flex flex-col sm:flex-row gap-3">
    <UInput
      v-model="search"
      icon="i-lucide-search"
      placeholder="Пошук товарів..."
      class="flex-1"
    />
    <USelect
  v-model="statusFilter"
  :items="statusOptions"
  class="w-full sm:w-48"
  :content="{ side: 'bottom', align: 'start' }"
/>
  </div>

  <UTable
  :data="filteredProducts"
  :columns="columns"
  :ui="{
    tr: 'hover:bg-muted/40 transition'
}"
>
      <template #name-cell="{ row }">
        <div class="flex items-center gap-3">

          <img
            v-if="row.original.imageUrl"
            :src="row.original.imageUrl"
            class="w-14 h-14 rounded-xl object-cover border"
          >

          <div
            v-else
            class="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center"
          >
            <UIcon
              name="i-lucide-image"
              class="text-xl text-gray-400"
            />
          </div>

          <div>

            <div class="font-semibold">
              {{ row.original.name }}
            </div>

            <div class="text-xs text-gray-500">
              {{ row.original.brand }}
            </div>

            <div class="text-xs text-gray-400">
              {{ row.original.slug }}
            </div>

          </div>

        </div>
      </template>
      <template #profit-cell="{ row }">

        <span
          class="font-semibold"
          :class="row.original.sellPrice-row.original.buyPrice>=0
            ? 'text-green-600'
            : 'text-red-600'"
        >

          {{ row.original.sellPrice-row.original.buyPrice }} грн

        </span>

      </template>
     <template #margin-cell="{ row }">

  <span
    class="font-semibold text-sky-600"
  >

    {{
      (
        ((row.original.sellPrice-row.original.buyPrice)
        /row.original.buyPrice)
        *100
      ).toFixed(1)
    }} %

  </span>

</template>
      <template #active-cell="{ row }">

        <UBadge
          :color="row.original.active ? 'success' : 'neutral'"
        >
          {{ row.original.active ? 'Активний' : 'Вимкнений' }}
        </UBadge>

      </template>
      <template #quantity-cell="{ row }">

        <UBadge
          :color="
            row.original.quantity > 10
              ? 'success'
              : row.original.quantity > 0
                ? 'warning'
                : 'error'
          "
        >
          {{ row.original.quantity }}
        </UBadge>

      </template>
      <template #actions-cell="{ row }">

        <div class="flex gap-2 justify-center">

          <UButton
            icon="i-lucide-pencil"
            size="xs"
            color="warning"
            @click="editProduct(row.original)"
          />

          <UButton
            icon="i-lucide-trash"
            size="xs"
            color="error"
            @click="confirmDelete(row.original.id)"
          />

        </div>

      </template>

  </UTable>
</UCard>
    <AdminProductsModal
      v-model:open="isModalOpen"
      v-model:form="form"
      :editingItem="editingItem"
      :submitting="submitting"
       @submit="saveProduct"
       @cancel="isModalOpen = false"
    />
    <UModal v-model:open="deleteModal">
  <template #header>
    <h2 class="text-xl font-semibold">
      Видалити товар?
    </h2>
  </template>

  <template #body>
    Ви дійсно хочете видалити

    <b>{{ deletingItem?.name }}</b> ?
  </template>

  <template #footer>
    <div class="flex justify-end gap-3">
      <UButton
        color="neutral"
        variant="soft"
        @click="deleteModal = false"
      >
        Скасувати
      </UButton>

      <UButton
        color="error"
        icon="i-lucide-trash"
        @click="deleteProduct"
      >
        Видалити
      </UButton>
    </div>
  </template>
</UModal>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/types'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const toast = useToast()

const submitting = ref(false)
const editingItem = ref<any>(null)
const deleteModal = ref(false)
const deletingItem = ref<Product | null>(null)

const search = ref('')
const statusFilter = ref('all')
  

function createEmptyProduct() {
  return {
    name: '',
    slug: '',
    shortDescription: '',
    description: '',

    brand: '',
    category: '',

    buyPrice: 0,
    sellPrice: 0,
    quantity: 0,

    imageUrl: '',
    imageId: '',

    isFeatured: false,
    isPopular: false,
    isNew: false,
    isSale: false,

    featuredOrder: 0,
    sortOrder: 0,

    active: true
  }
}

const statusOptions = [
  { label: 'Всі', value: 'all' },
  { label: 'Активні', value: 'active' },
  { label: 'Неактивні', value: 'inactive' }
]


const form = ref(createEmptyProduct())
const {
  data: products,
  pending,
  error
} = await useFetch<Product[]>('/api/products', {
  default: () => []
})
const isModalOpen = ref(false)

function openCreateModal() {
  editingItem.value = null

  form.value = createEmptyProduct()

  isModalOpen.value = true
}

function editProduct(product: Product) {
  editingItem.value = product

  form.value = {
    ...product
  }

  isModalOpen.value = true
}

function closeCreateModal() {
  
  isModalOpen.value = false
}
async function loadProducts() {
  products.value = await $fetch('/api/products')
}

async function saveProduct() {
  try {
    submitting.value = true

    if (editingItem.value) {
      await $fetch(`/api/products/by-slug/${editingItem.value.slug}`, {
        method: 'PUT',
        body: form.value
      })
    } else {
      await $fetch('/api/products', {
        method: 'POST',
        body: form.value
      })
    }


      await loadProducts()
      toast.add({
        title: editingItem.value
          ? 'Товар оновлено'
          : 'Товар створено',
        description: form.value.name,
        color: 'success',
        icon: 'i-lucide-check-circle'
      })

    isModalOpen.value = false
    editingItem.value = null
    form.value = createEmptyProduct()

    
  }
  catch (error) {
  toast.add({
    title: 'Помилка',
    description: 'Не вдалося виконати операцію',
    color: 'error',
    icon: 'i-lucide-circle-alert'
  })

  console.error(error)
}
  finally {
    submitting.value = false
  }
}
// Delete product
function confirmDelete(product: Product) {
  deletingItem.value = product
  deleteModal.value = true
}

async function deleteProduct() {
  if (!deletingItem.value) return

  await $fetch(`/api/products/by-slug/${deletingItem.value.slug}`, {
    method: 'DELETE'
  })

  deleteModal.value = false
  deletingItem.value = null

  await loadProducts()
  toast.add({
  title: 'Товар видалено',
  color: 'error',
  icon: 'i-lucide-trash'
})
}
// Define columns for the table
const columns = [
  {
  accessorKey: 'name',
  header: 'Товар',
  enableSorting:true,
  
},
  {
    accessorKey: 'category',
    header: 'Категорія',
    enableSorting:true
  },
  {
    accessorKey: 'sellPrice',
    header: 'Продаж',
    enableSorting:true
  },
  {
    accessorKey: 'buyPrice',
    header: 'Закупка'
    
  },
  
  {
  id: 'profit',
  header: 'Прибуток'
},
{
  id: 'margin',
  header: 'Маржа'
},
  {
    accessorKey: 'quantity',
    header: 'Залишок',
    
  },
  {
    accessorKey: 'active',
    header: 'Статус'
  },
  {
    id: 'actions',
    header: ''
  }
]

const filteredProducts = computed(() => {
  let result = products.value
  // Filter by status
  if (statusFilter.value === 'active') {
  result = result.filter(product => product.active)
}

if (statusFilter.value === 'inactive') {
  result = result.filter(product => !product.active)
}
  // Filter by search
  if (search.value) {
    const query = search.value.toLowerCase()
    result = result.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.brand.toLowerCase().includes(query) ||
      product.slug.toLowerCase().includes(query)
    )
  }

  return result
})



</script>