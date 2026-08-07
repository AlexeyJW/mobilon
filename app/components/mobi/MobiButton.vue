<script setup lang="ts">
const mobi = useMobi()
</script>

<template>
  <UButton
  icon="i-lucide-message-circle"
  size="lg"
  color="primary"
  class="
    mobi-breathe
    fixed
    bottom-15
    right-6
    z-50
    rounded-full
    shadow-xl
  "
  @click="mobi.show()"
>
  Порадитись з Мобі
</UButton>
</template>