<template>
        <UCard class="bg-elevated">
        <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border">
              <th 
                class="text-left py-3 px-4 text-muted text-sm font-medium cursor-pointer hover:text-default transition-colors"
                @click="emit('sort','name')"
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
            <tr v-else-if="!props.items.length" class="border-b border-border">
              <td colspan="5" class="py-8 text-center text-muted">
                <Icon name="i-lucide-package" class="w-12 h-12 mx-auto text-dimmed" />
                <p class="mt-2 text-sm">Немає товарів на складі</p>
                <p class="text-xs text-dimmed">Додайте перший товар</p>
              </td>
            </tr>
            
            <!-- Список товарів -->
            <tr
  v-for="item in props.items"
  :key="item.id"
  class="border-b border-border transition-colors"
  :class="[
    getRowClass(item.status),
    editingItem?.id === item.id && 'ring-2 ring-primary'
  ]"
> 
              <td class="py-3 px-4 text-default font-medium">
                {{ item.name }}
              </td>
<td class="py-3 px-4">

  <div class="flex items-center gap-2">

    <UButton
      icon="i-lucide-minus"
      color="neutral"
      variant="ghost"
      size="xs"
      @click="updateQuantity(item, -1)"
    />

    <UBadge
      :color="getQuantityColor(item.quantity)"
      variant="soft"
      class="min-w-16 justify-center"
    >
      {{ item.quantity }}
    </UBadge>

    <UButton
      icon="i-lucide-plus"
      color="primary"
      variant="ghost"
      size="xs"
      @click="updateQuantity(item, 1)"
    />

  </div>

</td>
              <td class="py-3 px-4">

<UBadge
  :label="statusConfig[item.status].label"
  :color="statusConfig[item.status].color"
  variant="soft"
  class="cursor-pointer"
  @click="emit('status', item)"
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
                   @click="emit('edit', item)"
                  >
                    <Icon name="i-lucide-pencil" class="w-4 h-4" />
                  </UButton>
                  <UButton
                    color="red"
                    variant="ghost"
                    size="xs"
                   @click="emit('delete', item)"
                  >
                    <Icon name="i-lucide-trash" class="w-4 h-4" />
                  </UButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div v-if="props.items.length" class="mt-4 text-xs text-muted text-center border-t border-border pt-4">
        Показано {{ props.items.length }} з {{ props.total }} товарів
      </div>
    </UCard>
</template>

<script setup lang="ts">
const props = defineProps({
  items: Array,
   total: Number,
  pending: Boolean,
  editingItem: Object,
  filterSort: String
})

const emit = defineEmits([
  'sort',
  'edit',
  'delete',
  'status'
])

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

const getRowClass = (status) => {
  switch (status) {
    case 'pending':
      return 'bg-orange-500/8 hover:bg-orange-500/12'

    case 'ordered':
      return 'bg-blue-500/8 hover:bg-blue-500/12'

    case 'received':
      return 'bg-green-500/8 hover:bg-green-500/12'

    case 'archived':
      return 'bg-neutral-500/5 hover:bg-neutral-500/10'

    default:
      return 'hover:bg-elevated/50'
  }
}

</script>

<style scoped>

</style>