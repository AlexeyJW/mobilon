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
    <UCard class="bg-elevated">
      <form @submit.prevent="handleSubmit" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <UInput
          v-model="form.name"
          placeholder="Назва товару *"
          size="lg"
          autocomplete="off"
          required
        />
        
        <UInput
          v-model.number="form.quantity"
          type="number"
          min="1"
          placeholder="Кількість"
          size="lg"
          autocomplete="off"
        />
        
        <UInput
          v-model="form.supplier"
          placeholder="Постачальник"
          size="lg"
          autocomplete="off"
        />
        
        <div class="flex gap-2">
          <UButton
            type="submit"
            color="primary"
            size="lg"
            class="flex-1"
            :loading="submitting"
          >
            <Icon name="i-lucide-plus" class="w-4 h-4" />
            Додати
          </UButton>
          
          <UButton
            v-if="editingItem"
            color="neutral"
            variant="ghost"
            size="lg"
            @click="cancelEdit"
          >
            <Icon name="i-lucide-x" class="w-4 h-4" />
          </UButton>
        </div>
      </form>
      
      <p v-if="editingItem" class="text-sm text-primary mt-2">
        ✏️ Редагування: {{ editingItem.name }}
      </p>
    </UCard>

    <!-- Фільтри -->
    <UCard class="bg-elevated">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <UInput
            v-model="searchQuery"
            placeholder="Пошук за назвою або постачальником..."
            icon="i-lucide-search"
            size="lg"
          />
        </div>
        
        <div class="flex flex-wrap gap-2">
          <USelect
            v-model="filterSupplier"
            :options="supplierOptions"
            placeholder="Постачальник"
            size="lg"
            class="w-40"
          />
          
          <USelect
            v-model="filterSort"
            :options="sortOptions"
            placeholder="Сортувати"
            size="lg"
            class="w-40"
          />
          
          <UButton
            color="neutral"
            variant="ghost"
            size="lg"
            @click="resetFilters"
          >
            <Icon name="i-lucide-rotate-ccw" class="w-4 h-4" />
            Скинути
          </UButton>
        </div>
      </div>
    </UCard>

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
    <UCard class="bg-elevated">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border">
              <th 
                class="text-left py-3 px-4 text-muted text-sm font-medium cursor-pointer hover:text-default transition-colors"
                @click="toggleSort('name')"
              >
                <div class="flex items-center gap-1">
                  Назва
                  <Icon 
                    v-if="filterSort === 'name-asc'" 
                    name="i-lucide-arrow-up" 
                    class="w-3 h-3"
                  />
                  <Icon 
                    v-else-if="filterSort === 'name-desc'" 
                    name="i-lucide-arrow-down" 
                    class="w-3 h-3"
                  />
                </div>
              </th>
              <th 
                class="text-left py-3 px-4 text-muted text-sm font-medium cursor-pointer hover:text-default transition-colors"
                @click="toggleSort('quantity')"
              >
                <div class="flex items-center gap-1">
                  Кількість
                  <Icon 
                    v-if="filterSort === 'quantity-asc'" 
                    name="i-lucide-arrow-up" 
                    class="w-3 h-3"
                  />
                  <Icon 
                    v-else-if="filterSort === 'quantity-desc'" 
                    name="i-lucide-arrow-down" 
                    class="w-3 h-3"
                  />
                </div>
              </th>
              <th class="text-left py-3 px-4">
                Статус
              </th>
              <th class="text-left py-3 px-4 text-muted text-sm font-medium hidden md:table-cell">
                Постачальник
              </th>
              <th 
                class="text-left py-3 px-4 text-muted text-sm font-medium hidden lg:table-cell cursor-pointer hover:text-default transition-colors"
                @click="toggleSort('createdAt')"
              >
                <div class="flex items-center gap-1">
                  Дата
                  <Icon 
                    v-if="filterSort === 'createdAt-asc'" 
                    name="i-lucide-arrow-up" 
                    class="w-3 h-3"
                  />
                  <Icon 
                    v-else-if="filterSort === 'createdAt-desc'" 
                    name="i-lucide-arrow-down" 
                    class="w-3 h-3"
                  />
                </div>
              </th>
              <th class="text-left py-3 px-4 text-muted text-sm font-medium">Дії</th>
            </tr>
          </thead>
          <tbody>
            <!-- Стан завантаження -->
            <tr v-if="pending" class="border-b border-border">
              <td colspan="5" class="py-8 text-center text-muted">
                <Icon 
                  name="i-lucide-loader-circle" 
                  class="w-8 h-8 mx-auto text-primary animate-spin"
                />
                <span class="block mt-2 text-sm">Завантаження...</span>
              </td>
            </tr>
            
            <!-- Стан порожнього списку -->
            <tr v-else-if="!filteredPurchases.length" class="border-b border-border">
              <td colspan="5" class="py-8 text-center text-muted">
                <Icon name="i-lucide-package" class="w-12 h-12 mx-auto text-dimmed" />
                <p class="mt-2 text-sm">Немає товарів на складі</p>
                <p class="text-xs text-dimmed">Додайте перший товар</p>
              </td>
            </tr>
            
            <!-- Список товарів -->
            <tr
              v-for="item in filteredPurchases"
              :key="item.id"
              class="border-b border-border hover:bg-elevated/50 transition-colors"
              :class="{ 'bg-primary/5': editingItem?.id === item.id }"
            >
              <td class="py-3 px-4 text-default font-medium">
                {{ item.name }}
              </td>
              <td class="py-3 px-4">
                <UBadge 
                  :color="getQuantityColor(item.quantity)" 
                  variant="soft"
                >
                  {{ item.quantity }} шт.
                </UBadge>
              </td>
              <td class="py-3 px-4">

<UBadge
  :label="statusConfig[item.status].label"
  :color="statusConfig[item.status].color"
  variant="soft"
  class="cursor-pointer"
  @click="nextStatus(item)"
/>
</td>
              <td class="py-3 px-4 text-muted hidden md:table-cell">
                <UBadge color="neutral" variant="outline">
                  {{ item.supplier || '—' }}
                </UBadge>
              </td>
              <td class="py-3 px-4 text-muted text-sm hidden lg:table-cell">
                {{ formatDate(item.createdAt) }}
              </td>
              <td class="py-3 px-4">
                <div class="flex items-center gap-2">
                  <UButton
                    color="primary"
                    variant="ghost"
                    size="xs"
                    @click="editItem(item)"
                  >
                    <Icon name="i-lucide-pencil" class="w-4 h-4" />
                  </UButton>
                  <UButton
                    color="red"
                    variant="ghost"
                    size="xs"
                    @click="askDelete(item)"
                  >
                    <Icon name="i-lucide-trash" class="w-4 h-4" />
                  </UButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div v-if="filteredPurchases.length" class="mt-4 text-xs text-muted text-center border-t border-border pt-4">
        Показано {{ filteredPurchases.length }} з {{ purchases?.length || 0 }} товарів
      </div>
    </UCard>
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
          @click="deleteItem"
        >
          Видалити
        </UButton>

      </div>

    </div>

  </template>

</UModal>
  </div>
</template>

<script setup>
import * as XLSX from 'xlsx'

// Завантаження даних
const { data: purchases, refresh, pending } = await useFetch('/api/purchases')

// Стан фільтрів
const searchQuery = ref('')
const filterSupplier = ref('all')
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
const getQuantityColor = (quantity) => {
  if (quantity < 5) return 'red'
  if (quantity < 20) return 'yellow'
  if (quantity < 50) return 'primary'
  return 'green'
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const statusConfig = {
  pending: {
    label: 'Потрібно',
    color: 'warning'
  },

  ordered: {
    label: 'Замовлено',
    color: 'primary'
  },

  received: {
    label: 'Отримано',
    color: 'success'
  },

  archived: {
    label: 'Архів',
    color: 'neutral'
  }
}

const resetFilters = () => {
  searchQuery.value = ''
  filterSupplier.value = 'all'
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
const deleteItem = async () => {
  if (!deletingItem.value) return

  try {
    await $fetch(`/api/purchases/${deletingItem.value.id}`, {
      method: 'DELETE'
    })

    if (editingItem.value?.id === deletingItem.value.id) {
      resetForm()
    }

    await refresh()

    toast.add({
      title: 'Товар видалено',
      description: deletingItem.value.name,
      color: 'success',
      icon: 'i-lucide-trash-2'
    })
  }
  catch (e) {
    toast.add({
      title: 'Помилка',
      description: 'Не вдалося видалити товар',
      color: 'error'
    })
  }
  finally {
    deleteModal.value = false
    deletingItem.value = null
  }
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