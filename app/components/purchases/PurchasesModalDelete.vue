<template>
  <UModal :open="open" @update:open="$emit('update:open', $event)">
    <template #content>
      <div class="p-6 space-y-5">

        <div class="flex items-center gap-3">
          <UIcon
            name="i-lucide-triangle-alert"
            class="text-red-500 text-3xl"
          />

          <div>
            <h3 class="font-semibold">
              Видалити товар?
            </h3>

            <p class="text-sm text-muted">
              {{ item?.name }}
            </p>
          </div>
        </div>

        <div class="flex justify-end gap-2">
          <UButton
            color="neutral"
            variant="soft"
            @click="$emit('update:open', false)"
          >
            Скасувати
          </UButton>

          <UButton
            color="error"
            @click="$emit('confirm')"
          >
            Видалити
          </UButton>
        </div>

      </div>
    </template>
  </UModal>
</template>

<script setup>
defineProps({
  open: Boolean,
  item: Object
})

defineEmits([
  'update:open',
  'confirm'
])
</script>