<script setup>


definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const bonusAmount = ref(10)
const bonusReason = ref('')
const notes= ref('')
const route = useRoute()

const { data, refresh } = await useFetch(
  `/api/customers/${route.params.id}`
)
watchEffect(() => {
  if (data.value) {
    notes.value = data.value.notes || ''
  }
})
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

async function addBonus(amount) {
  await $fetch(`/api/customers/${route.params.id}/bonus`, {
    method: 'POST',
    body: {
      amount,
      reason: bonusReason.value
    }
  })

  bonusReason.value = ''

  await refresh()
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
<UCard class="mt-4">
  <template #header>
    🎁 Бонуси
  </template>

  <div class="space-y-3">

    <UInput
      v-model="bonusReason"
      placeholder="Причина"
    />

    <div class="flex gap-2">

      <UButton
        color="success"
        @click="addBonus(10)"
      >
        +10
      </UButton>

      <UButton
        color="success"
        @click="addBonus(50)"
      >
        +50
      </UButton>

      <UButton
        color="error"
        @click="addBonus(-50)"
      >
        -50
      </UButton>

    </div>

  </div>
</UCard>
</template>