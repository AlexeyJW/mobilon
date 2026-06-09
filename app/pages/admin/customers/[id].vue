<script setup>
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const route = useRoute()

const { data } = await useFetch(
  `/api/customers/${route.params.id}`
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


</template>