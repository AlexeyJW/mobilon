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
    </div>

    <!-- Форма додавання товару (прямо на сторінці) -->
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
      
      <!-- Підказка -->
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
                    @click="deleteItem(item.id)"
                  >
                    <Icon name="i-lucide-trash" class="w-4 h-4" />
                  </UButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Інформація про кількість -->
      <div v-if="filteredPurchases.length" class="mt-4 text-xs text-muted text-center border-t border-border pt-4">
        Показано {{ filteredPurchases.length }} з {{ purchases?.length || 0 }} товарів
      </div>
    </UCard>
  </div>
</template>

<script setup>
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
  
  // Скрол до форми
  document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })
}

const cancelEdit = () => {
  resetForm()
}

const handleSubmit = async () => {
  if (!form.value.name.trim()) {
    alert('Будь ласка, введіть назву товару')
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
    
    refresh()
    resetForm()
  } catch (error) {
    console.error('Помилка:', error)
    alert('Сталася помилка. Спробуйте ще раз.')
  } finally {
    submitting.value = false
  }
}

const deleteItem = async (id) => {
  if (!confirm('Ви впевнені, що хочете видалити цей товар?')) return
  
  try {
    await $fetch(`/api/purchases/${id}`, {
      method: 'DELETE'
    })
    refresh()
    
    if (editingItem.value?.id === id) {
      resetForm()
    }
  } catch (error) {
    console.error('Помилка видалення:', error)
    alert('Сталася помилка при видаленні')
  }
}
</script>