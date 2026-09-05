<script setup lang="ts">
defineProps<{
  title?: string
  description?: string
}>()
</script>

<template>
  <div
    class="rounded-2xl border border-default bg-default overflow-hidden"
  >

    <!-- HEADER -->

    <div
      v-if="title || description || $slots.actions"
      class="flex flex-col gap-4 border-b border-default px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
    >

      <div>
        <h2
          v-if="title"
          class="text-lg font-semibold"
        >
          {{ title }}
        </h2>

        <p
          v-if="description"
          class="mt-1 text-sm text-muted"
        >
          {{ description }}
        </p>
      </div>

      <!-- ACTIONS -->

      <div
        v-if="$slots.actions"
        class="flex shrink-0 items-center gap-2"
      >
        <slot name="actions" />
      </div>

    </div>

    <!-- CONTENT -->

    <div class="p-6">
      <slot />
    </div>

  </div>

</template>
