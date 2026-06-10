<script setup>


definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})


const notes= ref('')
const route = useRoute()

const { data } = await useFetch(
  `/api/customers/${route.params.id}`
)
watch(
  data,
  (val) => {
    if (val) {
      notes.value = val.notes || ''
    }
  },
  { immediate: true }
)
function getLevel(points) {
  if (points >= 100) {
    return '🥇 Золото'
  }

  if (points >= 50) {
    return '🥈 Срібло'
  }

  return '🥉 Бронза'
}

const toast = useToast()

async function saveNotes() {
  try {
    await $fetch(`/api/customers/${route.params.id}`, {
      method: 'PATCH',

      body: {
        notes: notes.value
      }
    })

    toast.add({
      title: 'Нотатки збережено',
      color: 'success'
    })

  } catch (error) {
    console.error(error)

    toast.add({
      title: 'Помилка збереження',
      color: 'error'
    })
  }
}
</script>
<template>
  <UCard>
   <div class="space-y-2">
    <p><strong>Ім'я:</strong> {{ data?.name }}</p>
    <p><strong>Телефон:</strong> {{ data?.phone }}</p>
    <p><strong>Візитів:</strong> {{ data?.visits }}</p>
    <p><strong>Бонусів:</strong> {{ data?.points }}</p>
    <p>
  <strong>Рівень:</strong>
  {{ getLevel(data?.points || 0) }}
</p>
    <p><strong>Заявок:</strong> {{ data?.requests?.length }}</p>

  </div>
  <div>
        <p v-for ="request in data?.requests" :key="request.id">
          
          <UIcon name="i-heroicons-star" class="size-5" /> {{  request.description }}
        </p>

      </div>
</UCard>
<UCard class="mt-4">
  <template #header>
    📝 Нотатки
  </template>

  <UTextarea
    v-model="notes"
    :rows="5"
    placeholder="Додайте інформацію про клієнта..."
  />

  <div class="mt-4">
    <UButton @click="saveNotes">
      Зберегти
    </UButton>
  </div>
</UCard>

</template>