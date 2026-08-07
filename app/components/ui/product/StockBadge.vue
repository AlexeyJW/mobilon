<script setup lang="ts">
const props = defineProps<{
  quantity: number
}>()

const color = computed(() => {
  if (props.quantity <= 0) return 'error'
  if (props.quantity <= 5) return 'warning'
  return 'success'
})

const text = computed(() => {
  if (props.quantity <= 0) return 'Немає'
  if (props.quantity <= 5) return 'Закінчується'
  return 'В наявності'
})

const icon = computed(() => {
  if (props.quantity <= 0) return 'i-lucide-circle-x'
  if (props.quantity <= 5) return 'i-lucide-alert-circle'
  return 'i-lucide-check-circle'
})
</script>

<template>
  <UBadge
    :color="color"
    variant="soft"
    :icon="icon"
  >
    {{ text }}
  </UBadge>
</template>