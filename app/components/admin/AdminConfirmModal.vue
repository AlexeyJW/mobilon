<script setup lang="ts">
const open = defineModel<boolean>('open', { required: true })

const props = withDefaults(defineProps<{
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  color?: 'error' | 'primary' | 'warning'
}>(), {
  confirmLabel: 'Підтвердити',
  cancelLabel: 'Скасувати',
  color: 'primary'
})

const emit = defineEmits<{
  confirm: []
}>()

function onConfirm() {
  emit('confirm')
  open.value = false
}
</script>

<template>
 <UModal
  v-model:open="open"
  :dismissible="true"
>

  <template #content>
    <UCard>

      <template #header>
        <h3 class="text-lg font-semibold">
          {{ title }}
        </h3>
      </template>

      <p class="text-muted">
        {{ description }}
      </p>

      <template #footer>
        <div class="flex justify-end gap-3">

          <UButton
            color="neutral"
            variant="soft"
            @click="open = false"
          >
            {{ cancelLabel }}
          </UButton>

          <UButton
            :color="color"
            @click="onConfirm"
          >
            {{ confirmLabel }}
          </UButton>

        </div>
      </template>

    </UCard>
  </template>

</UModal>
</template>