<script setup lang="ts">
defineProps<{
  items: any[]
  pending: boolean
}>()

const emit = defineEmits<{
  edit: [item: any]
  delete: [item: any]
}>()
</script>

<template>
  <UCard class="overflow-x-auto">

    <div
      v-if="pending"
      class="py-10 text-center text-muted"
    >
      Завантаження...
    </div>

   <table class="w-full">

<thead>

<tr class="border-b">

<th class="py-3"></th>

<th class="text-left">Назва</th>


<th>Продаж</th>

<th>Залишок</th>

<th class="text-center">
  ⭐
</th>
<th></th>
</tr>

</thead>

<tbody>

<tr
v-for="item in items"
:key="item.id"
class="border-b hover:bg-muted/40 transition"
>

<td class="w-16">

<NuxtImg
  v-if="item.imageUrl"
  :src="item.imageUrl"
  width="44"
  height="44"
  class="rounded-lg object-cover border"
/>

<div
v-else
class="w-14 h-14 rounded-lg bg-muted flex items-center justify-center"
>
📦
</div>

</td>

<td>

<div class="font-medium">

{{ item.name }}

</div>

</td>

<td>

<strong>

{{ item.sellPrice }} грн

</strong>

</td>

<td>

<UBadge
:color="
item.quantity > 10
? 'success'
: item.quantity > 3
? 'warning'
: 'error'
"
>

{{ item.quantity }}

</UBadge>

</td>
<td class="text-center">

  <UIcon
    v-if="item.isFeatured"
    name="i-lucide-star"
    class="text-yellow-500"
  />

</td>
<td>

<div class="flex gap-2 justify-end">

<UButton
  icon="i-lucide-pencil"
  color="primary"
  variant="ghost"
  @click="$emit('edit', item)"
/>

<UButton
  icon="i-lucide-trash"
  color="error"
  variant="ghost"
  @click="$emit('delete', item)"
/>

</div>

</td>

</tr>

</tbody>

</table>

  </UCard>
</template>