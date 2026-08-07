<script setup lang="ts">
import slugify from 'slugify'

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

const brands = [
  'Samsung',
  'Apple',
  'Xiaomi',
  'Motorola',
  'Realme',
  'Honor',
  'Infinix',
  'Tecno',
  'Nokia',
  'ZTE',
  'HMD',
  'Інше'
]

const categories = [
  'Смартфони',
  'Чохли',
  'Захисне скло',
  'Гідрогелева плівка',
  'Зарядні пристрої',
  'Кабелі',
  'Навушники',
  'Power Bank',
  'Карти пам’яті',
  'Смарт-годинники',
  'Інше'
]

const profit = computed(() => {
  return Number(form.value.sellPrice || 0) - Number(form.value.buyPrice || 0)
})

const margin = computed(() => {
  const buy = Number(form.value.buyPrice || 0)
  const sell = Number(form.value.sellPrice || 0)

  if (!buy || !sell) return 0

  return ((sell - buy) / buy * 100).toFixed(1)
})

watch(
  () => form.value.name,
  (value) => {
    if (!value) return

    form.value.slug = slugify(value, {
      lower: true,
      strict: true,
      locale: 'uk'
    })
  }
)

// computed, watch, brands, categories...
</script>

<template>
<form
  class="flex flex-col"
  @submit.prevent="emit('submit')"
>

<div class="overflow-y-auto max-h-[70vh] space-y-6 p-6">

<!-- Фото -->

<UiSectionCard
  title="Фото"
  description="Головне фото товару"
>

<AdminImageUpload
  v-model:imageUrl="form.imageUrl"
  v-model:imageId="form.imageId"
/>

</UiSectionCard>

<!-- Основна інформація -->

<UiSectionCard
  title="Основна інформація"
>

<div class="grid md:grid-cols-2 gap-5">

<UFormField label="Назва товару">
<UInput
v-model="form.name"
placeholder="Samsung Galaxy A56"
/>
</UFormField>

<UFormField label="Slug">
<UInput
v-model="form.slug"
readonly
/>
</UFormField>

<UFormField label="Бренд">
<USelect
  v-model="form.brand"
  :items="brands"
  class="w-full min-w-[220px]"
/>
</UFormField>

<UFormField label="Категорія">
<USelect
v-model="form.category"
:items="categories"
 class="w-full min-w-[220px]" 
/>
</UFormField>

<UFormField label="Кількість">
<UInput
  v-model.number="form.quantity"
  type="number"
   class="w-24"
/>
</UFormField>

<UFormField label="Порядок">
<UInput
  v-model.number="form.sortOrder"
  type="number"
  class="w-24"
/>
</UFormField>

</div>

</UiSectionCard>

<!-- Ціни -->

<UiSectionCard
title="Ціни"
>

<div class="grid md:grid-cols-2 gap-5">

<UFormField label="Закупівельна ціна">
<UInput
v-model.number="form.buyPrice"
type="number"
/>
</UFormField>

<UFormField label="Ціна продажу">
<UInput
v-model.number="form.sellPrice"
type="number"
/>
</UFormField>

</div>

</UiSectionCard>

<!-- Опис -->

<UiSectionCard
title="Опис"
>

<UFormField label="Короткий опис">

<UInput
v-model="form.shortDescription"
/>

</UFormField>

<UFormField
label="Повний опис"
class="mt-5"
>

<UTextarea
v-model="form.description"
:rows="6"
/>

</UFormField>

</UiSectionCard>

<!-- Налаштування -->

<UiSectionCard
title="Відображення"
>

<div class="grid md:grid-cols-2 gap-4">

<UCheckbox
v-model="form.active"
label="Активний"
/>

<UCheckbox
v-model="form.isFeatured"
label="На головній"
/>

<UCheckbox
v-model="form.isPopular"
label="Популярний"
/>

<UCheckbox
v-model="form.isNew"
label="Новинка"
/>

<UCheckbox
v-model="form.isSale"
label="Акція"
/>

</div>

</UiSectionCard>

<!-- Фінанси -->

<UiSectionCard
title="Фінанси"
>

<div class="grid grid-cols-2 gap-6">

<div>

<p class="text-sm text-muted">
Прибуток
</p>

<p
class="text-2xl font-bold text-green-600"
>

{{ profit }} грн

</p>

</div>

<div>

<p class="text-sm text-muted">
Маржа
</p>

<p
class="text-2xl font-bold text-green-600"
>

{{ margin }} %

</p>

</div>

</div>

</UiSectionCard>

</div>

<!-- Кнопки -->

<div class="border-t p-6 flex justify-end gap-3">

<UButton
color="neutral"
variant="soft"
@click="emit('cancel')"
>

Скасувати

</UButton>

<UButton
type="submit"
:loading="submitting"
icon="i-lucide-save"
>

{{ editingItem ? 'Зберегти' : 'Створити' }}

</UButton>

</div>

</form>
</template>