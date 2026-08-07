<script setup lang="ts">
defineProps<{
  imageUrl?: string | null
  alt?: string
}>()
</script>

<template>
  <div
    class="relative flex items-center justify-center
           h-44 rounded-2xl
           bg-neutral-100 dark:bg-neutral-800
           overflow-hidden"
  >
    <NuxtImg
      v-if="imageUrl"
      :src="imageUrl"
      :alt="alt"
      width="220"
      height="220"
      class="max-h-36 object-contain transition duration-300 group-hover:scale-105"
    />

    <div
      v-else
      class="text-5xl opacity-40"
    >
      📦
    </div>
  </div>
</template>