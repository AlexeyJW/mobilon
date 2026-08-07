<script setup lang="ts">
const order = useOrder()
const toast = useToast()

const submitting = ref(false)

async function submit() {
 
  if (!order.customer.value.name || !order.customer.value.phone) {
    toast.add({
      title: 'Заповніть імʼя та телефон',
      color: 'warning'
    })
    return
  }

  submitting.value = true

  try {
    await $fetch('/api/orders', {
      method: 'POST',
      body: {
    customer: order.customer.value.name,
  phone: order.customer.value.phone,


  productName: order.product.value?.name,

  quantity: order.quantity.value,

  comment: order.customer.value.comment
}
    })

    toast.add({
      title: 'Заявку успішно відправлено',
      description: 'Ми зв’яжемося з вами найближчим часом.',
      color: 'success'
    })

    order.reset()
    order.hide()
  } catch (error) {
    console.error(error)

    toast.add({
      title: 'Помилка',
      description: 'Не вдалося відправити заявку.',
      color: 'error'
    })
  } finally {
    submitting.value = false
  }
}
</script>
<template>

<div class="max-h-[75vh] overflow-y-auto p-6 space-y-6">

  <!-- Товар -->
<OrderProduct
  :product="order.product.value"
  :quantity="order.quantity.value"
  @increase="order.quantity.value++"
  @decrease="order.quantity.value = Math.max(1, order.quantity.value - 1)"
/>

  <!-- Контакти -->

  <div class="grid gap-5">

    <UFormField label="Ваше ім'я">

      <UInput
        v-model="order.customer.value.name"
        placeholder="Ім'я"
      />

    </UFormField>

    <UFormField label="Телефон">

      <UInput
        v-model="order.customer.value.phone"
        placeholder="+380..."
      />

    </UFormField>

    <UFormField label="Коментар">

      <UTextarea
        v-model="order.customer.value.comment"
        :rows="5"
      />

    </UFormField>

  </div>

  <!-- Кнопки -->

  <div
  class="
    sticky
    bottom-0
    bg-default
    border-t
    p-4
    flex
    justify-end
    gap-3
  "
>

    <UButton
      color="neutral"
      variant="soft"
      @click="order.hide()"
    >
      Скасувати
    </UButton>

   <UButton
  color="primary"
  :loading="submitting"
  @click="submit"
>
  Відправити заявку
</UButton>

  </div>

</div>

</template>