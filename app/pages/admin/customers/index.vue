<script setup>

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})
const search = ref('')
watch(search, () => {
  refresh()
})
const { data: customers, refresh } = await useFetch('/api/customers', {
  query: {
    search
  }
})

const filteredCustomers = computed(() => {
  if (!customers.value) {
    return []
  }

  return customers.value.filter(customer =>
    customer.phone.includes(search.value) ||
    customer.name.toLowerCase().includes(search.value.toLowerCase())
  )
})
const totalCustomers = computed(() => {
  return customers.value?.length || 0
})

const goldCustomers = computed(() => {
  return customers.value?.filter(customer =>
    customer.points >= 100
  ).length || 0
})

const totalPoints = computed(() => {
  return customers.value?.reduce((sum, customer) =>
    sum + customer.points, 0
  ) || 0
})

const totalRequests = computed(() => {
  return customers.value?.reduce((sum, customer) =>
    sum + customer.requests.length, 0
  ) || 0
})

const topCustomers = computed(() => {
  return [...(customers.value || [])]
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 5)
})
</script>

<template>

  <section class="space-y-4">

    <h1 class="text-2xl font-bold">
      Клієнти
    </h1>
    <div class="grid grid-cols-2 gap-3 mb-6">

  <UCard>
    <div class="text-center">
      <p class="text-sm text-gray-500">
        👥 Клієнтів
      </p>

      <p class="text-2xl font-bold">
        {{ totalCustomers }}
      </p>
    </div>
  </UCard>

  <UCard>
    <div class="text-center">
      <p class="text-sm text-gray-500">
        📋 Заявок
      </p>

      <p class="text-2xl font-bold">
        {{ totalRequests }}
      </p>
    </div>
  </UCard>

  <UCard>
    <div class="text-center">
      <p class="text-sm text-gray-500">
        🥇 Золотих
      </p>

      <p class="text-2xl font-bold">
        {{ goldCustomers }}
      </p>
    </div>
  </UCard>

  <UCard>
    <div class="text-center">
      <p class="text-sm text-gray-500">
        🎁 Бонусів
      </p>

      <p class="text-2xl font-bold">
        {{ totalPoints }}
      </p>
    </div>
  </UCard>
<UCard class="mb-6">
  <template #header>
    🏆 ТОП клієнтів
  </template>

  <div
    v-for="customer in topCustomers"
    :key="customer.id"
    class="flex justify-between py-2"
  >
    <span>{{ customer.name }}</span>

    <UBadge color="warning">
      {{ customer.visits }} візитів
    </UBadge>
  </div>
</UCard>
</div>
    <UInput
  v-model="search"
  placeholder="Пошук по імені або телефону..."
  class="mb-4"
/>
    <div  
       v-for="customer in filteredCustomers"
      :key="customer.id">
    <NuxtLink  :to="`/admin/customers/${customer.id}`"
     
      class="block"
    >
    <UCard
      class="p-4"
    >

      <div class="space-y-2">

        <p>
          <strong>{{ customer.name }}</strong>
        </p>

        <p>
          {{ customer.phone }}
        </p>

        <p>
          Звернень:
          {{ customer.visits }}
        </p>

        <p>
          Бонусів:
          {{ customer.points }}
        </p>

      </div>

    </UCard>
</NuxtLink>
    
    </div>

   
  </section>

</template>