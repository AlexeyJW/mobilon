<script setup lang="ts">
const props = withDefaults(defineProps<{
  price: number
  oldPrice?: number | null
}>(), {
  oldPrice: null
})

const formattedPrice = computed(() =>
  props.price.toLocaleString('uk-UA')
)

const formattedOldPrice = computed(() =>
  props.oldPrice
    ? props.oldPrice.toLocaleString('uk-UA')
    : null
)
</script>

<template>
  <div class="flex items-end gap-2">

    <span class="text-2xl font-bold text-primary">
      {{ formattedPrice }} грн
    </span>

    <span
      v-if="formattedOldPrice"
      class="text-sm text-muted line-through"
    >
      {{ formattedOldPrice }} грн
    </span>

  </div>
</template>