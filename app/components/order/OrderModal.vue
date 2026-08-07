<script setup lang="ts">
const order = useOrder()

watch(order.product, (v) => {
  console.log('MODAL', v)
})
</script>

<template>
  <UModal
    v-model:open="order.open"
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