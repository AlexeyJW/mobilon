<script setup lang="ts">
const open = defineModel<boolean>('open', {
  default: false
})

const form = defineModel<any>('form', {
  required: true
})

defineProps<{
  submitting: boolean
  editingItem: any
}>()

const emit = defineEmits<{
  submit: []
  cancel: []
}>()
</script>

<template>

<UModal
  :open="open"
  @update:open="open = $event"
>
  <UCard>

    <template #header>

      <div class="flex items-center justify-between">

        <h2 class="text-xl font-bold">

          {{ editingItem ? 'Редагування товару' : 'Новий товар' }}

        </h2>

      </div>

    </template>

    <AdminProductsForm
      v-model:form="form"
      :editing-item="editingItem"
      :submitting="submitting"
      @submit="emit('submit')"
      @cancel="emit('cancel')"
    />

  </UCard>

</UModal>

</template>