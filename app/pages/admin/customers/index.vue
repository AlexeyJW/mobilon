<script setup>

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})
const search = ref('')

const { data } = await useFetch('/api/customers')

const filteredCustomers = computed(() => {
  if (!data.value) {
    return []
  }

  return data.value.filter(customer =>
    customer.phone.includes(search.value) ||
    customer.name.toLowerCase().includes(search.value.toLowerCase())
  )
})

</script>

<template>

  <section class="space-y-4">

    <h1 class="text-2xl font-bold">
      Клієнти
    </h1>
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