<script setup>
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const loading = ref(false)
const {
  data,
  refresh,
  pending
} = await useFetch('/api/test')
function getStatusColor(status) {
  switch (status) {
    case 'new':
      return 'error'

    case 'in_progress':
      return 'warning'

    case 'done':
      return 'success'

    default:
      return 'neutral'
  }
}
async function updateStatus(id, status) {

  loading.value = true

  console.log('STATUS UPDATE', id, status)

  try {

    await $fetch(`/api/request/${id}`, {
      method: 'PATCH',
      body: {
        status
      }
    })

    await refresh()

  } catch (error) {

    console.error(error)

  } finally {

    loading.value = false

  }

}
</script>

<template>
  <section class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">
        Заявки
      </h1>

      <UButton
  :loading="loading"
  :disabled="loading"
  @click="refresh"
>
  {{ loading ? 'Оновлення...' : 'Оновити' }}
</UButton>
    </div>
<div
  v-if="pending"
  class="space-y-4"
>

  <USkeleton class="h-40 rounded-2xl" />
  <USkeleton class="h-40 rounded-2xl" />
  <USkeleton class="h-40 rounded-2xl" />

</div>
    <div
  v-else
  class="grid gap-4"
>
      <UCard
        v-for="request in data || []"
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
          <div class="flex items-center gap-2">
            <strong>Статус:</strong>

              <UBadge
                :color="getStatusColor(request.status)"
                
              >
                {{ request.status }}
              </UBadge>
          </div>
<USelect
  v-model="request.status"
  :items="[
    'new',
    'in_progress',
    'done'
  ]"
  :disabled="loading"
  @update:model-value="
    updateStatus(request.id, $event)
  "
/>  
          <p class="text-sm text-gray-500">
            {{ new Date(request.createdAt).toLocaleString() }}
          </p>
        </div>
      </UCard>
    </div>
  </section>
</template>