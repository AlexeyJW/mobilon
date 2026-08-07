<script setup lang="ts">
const open = defineModel<boolean>('open')

const form = defineModel<any>('form')

defineProps<{
  editingItem: any
  submitting: boolean
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
    :ui="{
      content: 'max-w-5xl max-h-[90vh] overflow-y-auto'
    }"
  >
    <template #header>
      <h2 class="text-xl font-bold">
        {{ editingItem ? 'Редагування товару' : 'Новий товар' }}
      </h2>
    </template>

    <template #content>
      <AdminProductsForm
        v-model:form="form"
        :editing-item="editingItem"
        :submitting="submitting"
        @submit="emit('submit')"
        @cancel="emit('cancel')"
      />
    </template>
  </UModal>
</template>