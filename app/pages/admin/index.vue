<script setup>
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { data: stats } = await useFetch('/api/stats')
</script>
<template>
  <section>

    <h1 class="text-3xl font-bold mb-6">
      Dashboard
    </h1>

    <div class="grid md:grid-cols-5 gap-4">

      <UCard>
        <div class="text-center">
          <p>Клієнтів</p>

          <p class="text-3xl font-bold">
            {{ stats?.customers }}
          </p>
        </div>
      </UCard>

      <UCard>
        <div class="text-center">
          <p>Заявок</p>

          <p class="text-3xl font-bold">
            {{ stats?.requests }}
          </p>
        </div>
      </UCard>

      <UCard>
        <div class="text-center">
          <p>Нові</p>

          <p class="text-3xl font-bold text-red-500">
            {{ stats?.newRequests }}
          </p>
        </div>
      </UCard>

      <UCard>
        <div class="text-center">
          <p>В роботі</p>

          <p class="text-3xl font-bold text-yellow-500">
            {{ stats?.inProgressRequests }}
          </p>
        </div>
      </UCard>

      <UCard>
        <div class="text-center">
          <p>Завершені</p>

          <p class="text-3xl font-bold text-green-500">
            {{ stats?.doneRequests }}
          </p>
        </div>
      </UCard>

    </div>

  </section>
</template>