<template>
     <UCard class="bg-elevated">
      <form @submit.prevent="emit('submit')" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <UInput
          v-model="localForm.name"
          placeholder="Назва товару *"
          size="lg"
          autocomplete="off"
          required
        />
        
        <UInput
          v-model.number="localForm.quantity"
          type="number"
          min="1"
          placeholder="Кількість"
          size="lg"
          autocomplete="off"
        />
        
        <UInput
          v-model="localForm.supplier"
          placeholder="Постачальник"
          size="lg"
          autocomplete="off"
        />
        
        <div class="flex gap-2">
          <UButton
            type="submit"
            color="primary"
            size="lg"
            class="flex-1"
            :loading="submitting"
          >
            <Icon name="i-lucide-plus" class="w-4 h-4" />
            Додати
          </UButton>
          
          <UButton
            v-if="editingItem"
            color="neutral"
            variant="ghost"
            size="lg"
            @click="emit('cancel')"
          >
            <Icon name="i-lucide-x" class="w-4 h-4" />
          </UButton>
        </div>
      </form>
      
      <p v-if="editingItem" class="text-sm text-primary mt-2">
        ✏️ Редагування: {{ editingItem.name }}
      </p>
    </UCard>
</template>

<script setup lang="ts">
const props = defineProps({
  form: Object,
  editingItem: Object,
  submitting: Boolean
})

const emit = defineEmits([
  'update:form',
  'submit',
  'cancel'
])

const localForm = reactive({
  name: '',
  quantity: 1,
  supplier: '',
  note: ''
})

watch(
  () => props.form,
  value => {
    Object.assign(localForm, value)
  },
  {
    deep: true,
    immediate: true
  }
)

watch(
  localForm,
  value => {
    emit('update:form', { ...value })
  },
  {
    deep: true
  }
)
</script>

<style scoped>

</style>