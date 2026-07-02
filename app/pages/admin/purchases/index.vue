<!-- pages/admin/purchases/index.vue -->
<template>
  <div class="space-y-6">
    <!-- Заголовок -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-default">
          Закупівлі
        </h1>
        <p class="text-muted text-sm">
          Управління товарами на складі
        </p>
      </div>
      
      <!-- Кнопки дій -->
      <div class="flex gap-2">
        <UButton
          color="primary"
          variant="outline"
          @click="exportToExcel"
        >
          <Icon name="i-lucide-file-spreadsheet" class="w-4 h-4" />
          <span class="hidden sm:inline">Експорт Excel</span>
        </UButton>
      </div>
    </div>

    <!-- Форма додавання товару -->
    <PurchasesForm
        v-model:form="form"
        :editing-item="editingItem"
        :submitting="submitting"
        @submit="handleSubmit"
        @cancel="cancelEdit"
      />

    <!-- Фільтри -->
 <PurchasesFilters
  v-model:searchQuery="searchQuery"
  v-model:filterSupplier="filterSupplier"
  v-model:filterSort="filterSort"
  :supplier-options="supplierOptions"
  :sort-options="sortOptions"
  @reset="resetFilters"
/>

    <!-- Статистика -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <UCard class="bg-elevated">
        <div class="text-center">
          <p class="text-xs sm:text-sm text-muted">Всього товарів</p>
          <p class="text-xl sm:text-2xl font-bold text-default">{{ filteredPurchases.length }}</p>
        </div>
      </UCard>
      
      <UCard class="bg-elevated">
        <div class="text-center">
          <p class="text-xs sm:text-sm text-muted">Всього одиниць</p>
          <p class="text-xl sm:text-2xl font-bold text-default">{{ totalQuantity }}</p>
        </div>
      </UCard>
      
      <UCard class="bg-elevated">
        <div class="text-center">
          <p class="text-xs sm:text-sm text-muted">Постачальників</p>
          <p class="text-xl sm:text-2xl font-bold text-default">{{ uniqueSuppliers }}</p>
        </div>
      </UCard>
      
      <UCard class="bg-elevated">
        <div class="text-center">
          <p class="text-xs sm:text-sm text-muted">Останнє оновлення</p>
          <p class="text-lg sm:text-xl font-bold text-default text-xs sm:text-sm">
            {{ lastUpdate }}
          </p>
        </div>
      </UCard>
    </div>

    <!-- Таблиця товарів -->
        <PurchasesTable
          :items="filteredPurchases"
          :total="purchases?.length || 0"
          :pending="pending"
          :editing-item="editingItem"
          :filter-sort="filterSort"
          @sort="toggleSort"
          @edit="editItem"
          @delete="askDelete"
          @status="nextStatus"
        />
    <UModal v-model:open="deleteModal">

  <template #content>

    <div class="p-6 space-y-5">

      <div class="flex items-center gap-3">

        <UIcon
          name="i-lucide-triangle-alert"
          class="text-red-500 text-3xl"
        />

        <div>

          <h3 class="font-semibold">
            Видалити товар?
          </h3>

          <p class="text-sm text-muted">
            {{ deletingItem?.name }}
          </p>

        </div>

      </div>

      <div class="flex justify-end gap-2">

        <UButton
          color="neutral"
          variant="soft"
          @click="deleteModal=false"
        >
          Скасувати
        </UButton>

        <UButton
          color="error"
         @click="openDeleteModal(item)"
        >
          Видалити
        </UButton>

      </div>

    </div>
<UModal v-model:open="isDeleteModalOpen">
  <UCard>

    <template #header>
      <h3 class="text-lg font-semibold">
        Видалення товару
      </h3>
    </template>

    <p class="mb-6">
      Ви дійсно хочете видалити

      <strong>
        {{ deletingItem?.name }}
      </strong>?
    </p>

    <div class="flex justify-end gap-2">

      <UButton
        color="neutral"
        variant="soft"
        @click="isDeleteModalOpen = false"
      >
        Скасувати
      </UButton>

      <UButton
        color="error"
        @click="confirmDelete"
      >
        Видалити
      </UButton>

    </div>

  </UCard>
</UModal>
  </template>

</UModal>
  </div>
</template>

<script setup>
import * as XLSX from 'xlsx'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})
// Завантаження даних
const { data: purchases, refresh, pending } = await useFetch('/api/purchases')

// Стан фільтрів
const searchQuery = ref('')
const filterSupplier = ref('all')
const filterStatus = ref('all')
const filterSort = ref('createdAt-desc')

// Стан форми
const submitting = ref(false)
const editingItem = ref(null)

const form = ref({
  name: '',
  quantity: 1,
  supplier: '',
  note: ''
})

const statusOptions = [

  {
    label: '🟠 Потрібно замовити',
    value: 'pending'
  },

  {
    label: '🔵 Замовлено',
    value: 'ordered'
  },

  {
    label: '🟢 Отримано',
    value: 'received'
  },

  {
    label: '⚫ Архів',
    value: 'archived'
  }

]
async function nextStatus(item) {

  const order = [
    'pending',
    'ordered',
    'received',
    'archived'
  ]

  const index = order.indexOf(item.status)

  const next = order[(index + 1) % order.length]

  await updateStatus(item.id, next)

}

// Опції для фільтрів
const supplierOptions = computed(() => {
  if (!purchases.value) return [{ label: 'Всі', value: 'all' }]
  
  const suppliers = new Set()
  suppliers.add('all')
  
  purchases.value.forEach(item => {
    if (item.supplier) {
      suppliers.add(item.supplier)
    }
  })
  
  return Array.from(suppliers).map(s => ({
    label: s === 'all' ? 'Всі постачальники' : s,
    value: s
  }))
})

const sortOptions = [
  { label: 'Новіші', value: 'createdAt-desc' },
  { label: 'Старіші', value: 'createdAt-asc' },
  { label: 'Назва (А-Я)', value: 'name-asc' },
  { label: 'Назва (Я-А)', value: 'name-desc' },
  { label: 'Кількість (більше)', value: 'quantity-desc' },
  { label: 'Кількість (менше)', value: 'quantity-asc' }
]

const statusFilterOptions = [
  {
    label: 'Всі статуси',
    value: 'all'
  },
  {
    label: 'Потрібно замовити',
    value: 'pending'
  },
  {
    label: 'Замовлено',
    value: 'ordered'
  },
  {
    label: 'Отримано',
    value: 'received'
  },
  {
    label: 'Архів',
    value: 'archived'
  }
]
// Фільтровані та відсортовані дані
const filteredPurchases = computed(() => {
  if (!purchases.value) return []
  
  let items = [...purchases.value]
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase().trim()
    items = items.filter(item =>
      item.name.toLowerCase().includes(query) ||
      (item.supplier && item.supplier.toLowerCase().includes(query))
    )
  }
  
  if (filterSupplier.value !== 'all') {
    items = items.filter(item => item.supplier === filterSupplier.value)
  }
  if (filterStatus.value !== 'all') {
    items = items.filter(item => item.status === filterStatus.value)
}
  const [field, order] = filterSort.value.split('-')
  items.sort((a, b) => {
    let aVal = a[field]
    let bVal = b[field]
    
    if (field === 'createdAt') {
      aVal = new Date(aVal).getTime()
      bVal = new Date(bVal).getTime()
    }
    
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase()
      bVal = bVal.toLowerCase()
    }
    
    if (aVal < bVal) return order === 'asc' ? -1 : 1
    if (aVal > bVal) return order === 'asc' ? 1 : -1
    return 0
  })
  
  return items
})

// Статистика
const totalQuantity = computed(() => {
  return filteredPurchases.value.reduce((sum, item) => sum + item.quantity, 0)
})

const uniqueSuppliers = computed(() => {
  const suppliers = new Set()
  filteredPurchases.value.forEach(item => {
    if (item.supplier) {
      suppliers.add(item.supplier)
    }
  })
  return suppliers.size
})

const lastUpdate = computed(() => {
  if (!filteredPurchases.value.length) return '—'
  
  const dates = filteredPurchases.value.map(item => new Date(item.createdAt))
  const latest = new Date(Math.max(...dates))
  
  const now = new Date()
  const diff = now - latest
  
  if (diff < 60000) return 'Зараз'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} хв тому`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} год тому`
  return latest.toLocaleDateString('uk-UA')
})

// Методи


const formatDate = (date) => {
  return new Date(date).toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}



const resetFilters = () => {
  searchQuery.value = ''
  filterSupplier.value = 'all'
  filterStatus.value = 'all'
filterSort.value = 'createdAt-desc'
}

const toggleSort = (field) => {
  const [currentField, currentOrder] = filterSort.value.split('-')
  
  if (currentField === field) {
    filterSort.value = `${field}-${currentOrder === 'asc' ? 'desc' : 'asc'}`
  } else {
    filterSort.value = `${field}-asc`
  }
}

const resetForm = () => {
  form.value = {
    name: '',
    quantity: 1,
    supplier: '',
    note: ''
  }
  editingItem.value = null
}

const editItem = (item) => {
  editingItem.value = item
  form.value = {
    name: item.name,
    quantity: item.quantity,
    supplier: item.supplier || '',
    note: item.note || ''
  }
  
  document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })
}

const cancelEdit = () => {
  resetForm()
}
// Обробка відправки форми

//toast
const toast = useToast()
// modal
const isDeleteModalOpen = ref(false)


const deleteModal = ref(false)
const deletingItem = ref(null)


const openDeleteModal = (item) => {
  deletingItem.value = item
  isDeleteModalOpen.value = true
}

const handleSubmit = async () => {
  if (!form.value.name.trim()) {
  toast.add({
  title: 'Не заповнена назва',
  color: 'warning'
})
    return
  }
  
  submitting.value = true
  
  try {
    const url = editingItem.value 
      ? `/api/purchases/${editingItem.value.id}`
      : '/api/purchases'
    
    const method = editingItem.value ? 'PUT' : 'POST'
    
    await $fetch(url, {
      method,
      body: form.value
    })
    toast.add({
  title: editingItem.value
    ? 'Товар оновлено'
    : 'Товар додано',

  color: 'success'
})
    refresh()
    resetForm()
  } catch (error) {
    console.error('Помилка:', error)
    toast.add({
      title: 'Помилка',
      description: 'Спробуйте ще раз',
      color: 'error'
    })
  } finally {
    submitting.value = false
  }
}

const askDelete = (item) => {
  deletingItem.value = item
  deleteModal.value = true
}
const confirmDelete = async () => {

  if (!deletingItem.value) return

  try {

    await $fetch(`/api/purchases/${deletingItem.value.id}`, {
      method: 'DELETE'
    })

    toast.add({
      title: 'Товар видалено',
      description: deletingItem.value.name,
      color: 'success',
      icon: 'i-lucide-trash'
    })

    if (editingItem.value?.id === deletingItem.value.id) {
      resetForm()
    }

    await refresh()

  } catch (e) {

    toast.add({
      title: 'Помилка',
      description: 'Не вдалося видалити товар',
      color: 'error'
    })

  }

  isDeleteModalOpen.value = false
  deletingItem.value = null
}
async function updateStatus(id, status) {

  try {

    await $fetch(`/api/purchases/${id}`, {

      method: 'PATCH',

      body: {
        status
      }

    })

    refresh()

  } catch (e) {

    console.error(e)

  }

} 
// Кольорові рядки для статусів



// зміна кількості товару
async function updateQuantity(item, diff) {
  const newQuantity = item.quantity + diff

  if (newQuantity < 0) return

  try {
    await $fetch(`/api/purchases/${item.id}`, {
      method: 'PUT',
      body: {
        ...item,
        quantity: newQuantity
      }
    })

    await refresh()

    toast.add({
      title: 'Кількість оновлена',
      description: `${item.name}: ${newQuantity} шт.`,
      color: 'success'
    })

  } catch (e) {
    console.error(e)

    toast.add({
      title: 'Помилка',
      description: 'Не вдалося змінити кількість',
      color: 'error'
    })
  }
}
// Експорт в Excel з підтримкою кирилиці
const exportToExcel = () => {
  if (!filteredPurchases.value.length) {
    alert('Немає даних для експорту')
    return
  }
  
  try {
    // Підготовка даних з правильною кирилицею
    const data = filteredPurchases.value.map(item => ({
      'Назва': item.name,
      'Кількість': item.quantity,
      'Постачальник': item.supplier || '',
      'Примітка': item.note || '',
      'Дата': formatDate(item.createdAt)
    }))
    
    // Створення робочої книги
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(data)
    
    // Налаштування ширини колонок
    ws['!cols'] = [
      { wch: 30 }, // Назва
      { wch: 15 }, // Кількість
      { wch: 25 }, // Постачальник
      { wch: 30 }, // Примітка
      { wch: 25 }  // Дата
    ]
    
    // Додаємо стилі для заголовків
    const range = XLSX.utils.decode_range(ws['!ref'])
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_col(C) + '1'
      if (!ws[address]) continue
      ws[address].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "22C55E" } },
        alignment: { horizontal: "center" }
      }
    }
    
    XLSX.utils.book_append_sheet(wb, ws, 'Закупівлі')
    
    // Збереження файлу
    const fileName = `закупівлі_${new Date().toLocaleDateString('uk-UA').replace(/\//g, '-')}.xlsx`
    XLSX.writeFile(wb, fileName)
    
  } catch (error) {
    console.error('Помилка експорту:', error)
   toast.add({
  title: 'Помилка',
  description: 'Спробуйте ще раз',
  color: 'error'
})
  }
}

</script>