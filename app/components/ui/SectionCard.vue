<template>
    <UCard class="rounded-2xl shadow-sm">

    <template
      v-if="title"
      #header
    >
      <div>

        <h2 class="text-lg font-semibold">
          {{ title }}
        </h2>

        <p
          v-if="description"
          class="text-sm text-muted mt-1"
        >
          {{ description }}
        </p>

      </div>
    </template>

    <slot />

  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
  description?: string
}>()
</script>

<style scoped>

</style>