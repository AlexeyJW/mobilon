<script setup lang="ts">
const mobi = useMobi()
</script>

<template>
  <UButton
  icon="emojione-v1:blond-haired-person"
  size="xl"
  color="secondary"
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
  
<UIcon name="i-lucide-message-circle" class="size-5" />
Порадитись з Мобі
</UButton>
</template>