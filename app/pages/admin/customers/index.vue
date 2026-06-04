<script setup>

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { data } = await useFetch('/api/customers')

</script>

<template>

  <section class="space-y-4">

    <h1 class="text-2xl font-bold">
      Клієнти
    </h1>

    <UCard
      v-for="customer in data"
      :key="customer.id"
    >

      <div class="space-y-2">

        <p>
          <strong>{{ customer.CustomerName }}</strong>
        </p>

        <p>
          {{ customer.CustomerPhone }}
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

  </section>

</template>