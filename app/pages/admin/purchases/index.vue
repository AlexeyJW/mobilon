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
      
      <UButton
        color="primary"
        @click="isModalOpen = true"
      >
        <Icon name="i-lucide-plus" class="w-4 h-4" />
        Додати товар
      </UButton>
      <UButton
  color="success"
  variant="soft"
  @click="exportExcel"
>
  <Icon
    name="i-lucide-file-spreadsheet"
    class="w-4 h-4"
  />
  Excel
</UButton>
    </div>

    <!-- Фільтри та пошук -->
    <UCard class="bg-elevated">
      <div class="flex flex-col sm:flex-row gap-4">
        <!-- Пошук -->
        <div class="flex-1">
          <UInput
            v-model="searchQuery"
            placeholder="Пошук за назвою або постачальником..."
            icon="i-lucide-search"
            size="lg"
           
          />
        </div>
        
        <!-- Фільтри -->
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
            @change="applyFilters"
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
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
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
              <th class="text-left py-3 px-4 text-muted text-sm font-medium">
                Постачальник
              </th>
              <th class="text-left py-3 px-4 text-muted text-sm font-medium">
  Статус
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
              <th class="text-left py-3 px-4 text-muted text-sm font-medium hidden xl:table-cell">
  Примітка
</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="pending" class="border-b border-border">
              <td colspan="5" class="py-8 text-center text-muted">
                <USpinner class="w-6 h-6 mx-auto" />
                <span class="block mt-2 text-sm">Завантаження...</span>
              </td>
            </tr>
            <tr v-else-if="!filteredPurchases.length" class="border-b border-border">
              <td colspan="5" class="py-8 text-center text-muted">
                <Icon name="i-lucide-package" class="w-12 h-12 mx-auto text-dimmed" />
                <p class="mt-2 text-sm">Немає товарів на складі</p>
                <p class="text-xs text-dimmed">Додайте перший товар</p>
              </td>
            </tr>
            <tr
              v-for="item in filteredPurchases"
              :key="item.id"
              class="border-b border-border hover:bg-elevated/50 transition-colors"
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
                            <td class="py-3 px-4">
  <UBadge
    :color="
      item.status === 'pending'
        ? 'warning'
        : item.status === 'ordered'
          ? 'primary'
          : 'success'
    "
  >
    {{
      item.status === 'pending'
        ? 'Очікує'
        : item.status === 'ordered'
          ? 'Замовлено'
          : 'Отримано'
    }}
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
              <td class="py-3 px-4 hidden xl:table-cell">
  {{ item.note || '—' }}
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

    <!-- Модальне вікно додавання/редагування -->
    <UModal v-model="isModalOpen">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-default">
              {{ editingItem ? 'Редагувати товар' : 'Додати товар' }}
            </h3>
            <UButton
              color="neutral"
              variant="ghost"
              @click="closeModal"
            >
              <Icon name="i-lucide-x" class="w-5 h-5" />
            </UButton>
          </div>
        </template>

        <UForm :state="form" @submit="handleSubmit" class="space-y-4">
          <UFormGroup label="Назва товару" required>
            <UInput
              v-model="form.name"
              placeholder="Введіть назву товару"
              size="lg"
            />
          </UFormGroup>

          <UFormGroup label="Кількість">
            <UInput
              v-model.number="form.quantity"
              type="number"
              min="1"
              placeholder="1"
              size="lg"
            />
          </UFormGroup>

          <UFormGroup label="Постачальник">
            <UInput
              v-model="form.supplier"
              placeholder="Назва постачальника"
              size="lg"
            />
          </UFormGroup>

          <UFormGroup label="Примітка">
            <UTextarea
              v-model="form.note"
              placeholder="Додаткові примітки..."
              size="lg"
              :rows="3"
            />
          </UFormGroup>

          <div class="flex gap-3 pt-4">
            <UButton
              type="submit"
              color="primary"
              size="lg"
              block
              :loading="submitting"
            >
              {{ editingItem ? 'Оновити' : 'Додати' }}
            </UButton>
            <UButton
              color="neutral"
              variant="ghost"
              size="lg"
              @click="closeModal"
            >
              Скасувати
            </UButton>
          </div>
        </UForm>
      </UCard>
    </UModal>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})
// Завантаження даних
const { data: purchases, refresh, pending } = await useFetch('/api/purchases')

// Стан фільтрів
const searchQuery = ref('')
const filterSupplier = ref('all')
const filterSort = ref('createdAt-desc')

// Стан форми
const isModalOpen = ref(false)
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
  
  // Пошук
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase().trim()
    items = items.filter(item =>
      item.name.toLowerCase().includes(query) ||
      (item.supplier && item.supplier.toLowerCase().includes(query))
    )
  }
  
  // Фільтр постачальника
  if (filterSupplier.value !== 'all') {
    items = items.filter(item => item.supplier === filterSupplier.value)
  }
  
  // Сортування
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

const closeModal = () => {
  isModalOpen.value = false
  resetForm()
}

const editItem = (item) => {
  editingItem.value = item
  form.value = {
    name: item.name,
    quantity: item.quantity,
    supplier: item.supplier || '',
    note: item.note || ''
  }
  isModalOpen.value = true
}

const exportExcel = () => {

  window.open(
    '/api/purchases/export',
    '_blank'
  )

}



const handleSubmit = async () => {
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
    closeModal()
  } catch (error) {
    console.error('Помилка:', error)
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
  } catch (error) {
    console.error('Помилка видалення:', error)
  }
}
</script>