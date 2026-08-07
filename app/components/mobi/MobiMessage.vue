<script setup lang="ts">
import type { MobiMessage } from '~/types/mobi'

defineProps<{
  message: MobiMessage
}>()
</script>

<template>
  <div
    class="flex mb-4"
    :class="message.role === 'user'
      ? 'justify-end'
      : 'justify-start'"
  >
    <div
      class="max-w-[80%] rounded-2xl px-4 py-3 shadow-sm"
      :class="message.role === 'user'
        ? 'bg-primary text-white rounded-br-md'
        : 'bg-gray-100 text-gray-800 rounded-bl-md'"
    >
      <p class="whitespace-pre-line leading-6">
        {{ message.text }}
      </p>
    </div>
  </div>
</template>