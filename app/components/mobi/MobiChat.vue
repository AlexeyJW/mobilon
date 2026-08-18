<script setup lang="ts">
const mobi = useMobi()

const open = computed({
  get: () => mobi.open.value,
  set: (value: boolean) => {
    if (value) {
      mobi.show()
    } else {
      mobi.hide()
    }
  }
})
</script>

<template>
  <UModal
    v-model:open="open"
    :close="false"
    :dismissible="false"
    :ui="{
      content: 'max-w-xl p-0 overflow-hidden'
    }"
  >
    <template #header>
      <div class="flex items-center justify-between w-full">

        <div class="flex items-center gap-3">

          <UAvatar
            icon="i-lucide-bot"
            color="primary"
          />

          <div>

            <div class="font-semibold">
              Мобі
            </div>

            <div class="text-xs text-green-600">
              Онлайн
            </div>

          </div>

        </div>

        <div class="flex items-center gap-1">

          <UButton
            icon="i-lucide-trash-2"
            color="neutral"
            variant="ghost"
            square
            @click="mobi.clear()"
          />

          <UButton
            icon="i-lucide-x"
            color="neutral"
            variant="ghost"
            square
            @click="mobi.hide()"
          />

        </div>

      </div>
    </template>

    <template #body>

      <div class="flex flex-col h-[70vh]">

        <div class="flex-1 overflow-y-auto">
          <MobiMessages />
        </div>

        <MobiInput />

      </div>

    </template>

  </UModal>
</template>