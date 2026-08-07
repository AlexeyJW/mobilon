<script setup lang="ts">
const props = defineProps<{
  product: {
    isNew?: boolean
    isPopular?: boolean
    isSale?: boolean
    isFeatured?: boolean
  }
}>()

const badges = computed(() => {
  const items = []

  if (props.product.isNew) {
    items.push({
      label: 'Новинка',
      icon: 'i-lucide-sparkles',
      color: 'primary'
    })
  }

  if (props.product.isPopular) {
    items.push({
      label: 'Хіт',
      icon: 'i-lucide-flame',
      color: 'warning'
    })
  }

  if (props.product.isSale) {
    items.push({
      label: 'Акція',
      icon: 'i-lucide-badge-percent',
      color: 'error'
    })
  }

  if (props.product.isFeatured) {
    items.push({
      label: 'Рекомендуємо',
      icon: 'i-lucide-star',
      color: 'success'
    })
  }

  return items
})
</script>

<template>
  <div
    v-if="badges.length"
    class="absolute top-3 right-3 flex flex-col gap-2 z-10"
  >
    <UBadge
      v-for="badge in badges"
      :key="badge.label"
      :icon="badge.icon"
      :color="badge.color"
      variant="solid"
      size="sm"
    >
      {{ badge.label }}
    </UBadge>
  </div>
</template>