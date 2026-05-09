<script setup>
const { data, refresh } = await useFetch('/api/test')
</script>

<template>
  <section class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">
        Заявки
      </h1>

      <UButton @click="refresh">
        Оновити
      </UButton>
    </div>

    <div class="grid gap-4">
      <UCard
        v-for="request in data"
        :key="request.id"
      >
        <div class="space-y-2">
          <p>
            <strong>Імʼя:</strong>
            {{ request.name }}
          </p>

          <p>
            <strong>Телефон:</strong>
            {{ request.phone }}
          </p>

          <p>
            <strong>Опис:</strong>
            {{ request.description }}
          </p>

          <p class="text-sm text-gray-500">
            {{ new Date(request.createdAt).toLocaleString() }}
          </p>
        </div>
      </UCard>
    </div>
  </section>
</template>