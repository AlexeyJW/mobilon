<script setup lang="ts">
const mobi = useMobi()

const message = ref('')

async function send() {

  if (!message.value.trim()) return

  await mobi.send(message.value)

  message.value = ''

}
</script>

<template>
  <div class="border-t bg-white p-4">

    <div class="flex gap-3">

      <UInput
        v-model="message"
        class="flex-1"
        size="xl"
        placeholder="Напишіть повідомлення..."
        @keyup.enter="send"
      />

      <UButton
        icon="i-lucide-send-horizontal"
        size="xl"
        :loading="mobi.loading"
        @click="send"
      />

    </div>

  </div>
</template>