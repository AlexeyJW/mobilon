<script setup lang="ts">
const order = useOrder()

const modalOpen = computed({
  get: () => order.open.value,
  set: (value: boolean) => {
    order.open.value = value
  }
})

</script>

<template>
  <UModal
    v-model:open="modalOpen "
    :ui="{
      content: 'max-w-2xl'
    }"
  >
    <template #header>
      <h2 class="text-xl font-bold">
        Оформлення замовлення
      </h2>
    </template>

    <template #content>
      <OrderForm />
    </template>
  </UModal>
</template>