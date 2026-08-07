<script setup lang="ts">
defineProps<{
  title: string
  description: string
  badge?: string
}>()
</script>

<template>
  <section class="px-4 py-14">

    <div class="text-center mb-8">

      <UBadge
        v-if="badge"
        color="primary"
        variant="soft"
        class="mb-3"
      >
        {{ badge }}
      </UBadge>

      <h2 class="text-3xl font-bold">
        {{ title }}
      </h2>

      <p class="text-muted mt-2">
        {{ description }}
      </p>

    </div>

    <slot />

  </section>
</template>