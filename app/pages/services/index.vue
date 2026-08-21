<script setup lang="ts">
interface Service {
  id: number
  name: string
  description: string | null
  price: string | number
  category: string | null
  image: string | null
}

const loading = ref(true)

const { data, error } = await useFetch<{
  success: boolean
  services: Service[]
}>('/api/admin/services/public')

const services = computed(() => data.value?.services || [])

loading.value = false
</script>

<template>
  <div class="px-4 py-10 space-y-10 bg-default min-h-screen">

    <!-- Заголовок -->
    <section class="text-center space-y-3">
      <UBadge
        color="primary"
        variant="soft"
        size="lg"
      >
        Наші послуги
      </UBadge>

      <h1 class="text-4xl font-black text-default">
        Послуги Mobilon
      </h1>

      <p class="text-muted text-lg max-w-2xl mx-auto">
        Допоможемо налаштувати смартфон, перенести дані
        та вирішити проблеми з пристроєм.
      </p>
    </section>

    <!-- Завантаження -->
    <div
      v-if="loading"
      class="py-16 text-center text-muted"
    >
      Завантаження послуг...
    </div>

    <!-- Немає послуг -->
    <div
      v-else-if="!services.length"
      class="py-16 text-center text-muted"
    >
      Наразі доступних послуг немає.
    </div>

    <!-- Картки -->
    <section
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <UCard
        v-for="service in services"
        :key="service.id"
        class="overflow-hidden bg-elevated border-border"
      >
        <!-- Фото -->
        <div class="aspect-[16/10] bg-muted rounded-xl overflow-hidden mb-5">
          <img
            v-if="service.image"
            :src="service.image"
            :alt="service.name"
            class="w-full h-full object-cover"
          >

          <div
            v-else
            class="w-full h-full flex items-center justify-center text-primary"
          >
            <Icon
              name="i-lucide-wrench"
              class="w-16 h-16"
            />
          </div>
        </div>

        <!-- Категорія -->
        <UBadge
          v-if="service.category"
          color="primary"
          variant="soft"
          class="mb-3"
        >
          {{ service.category }}
        </UBadge>

        <!-- Назва -->
        <h2 class="text-xl font-bold text-default">
          {{ service.name }}
        </h2>

        <!-- Опис -->
        <p class="text-muted mt-2 line-clamp-3">
          {{ service.description || 'Допоможемо з налаштуванням смартфона.' }}
        </p>

        <!-- Ціна -->
        <div class="mt-5 text-lg font-bold text-default">
          {{ Number(service.price).toLocaleString('uk-UA') }} грн
        </div>

        <!-- Кнопки -->
        <div class="flex gap-2 mt-5">

          <UButton
             :to="`/?service=${encodeURIComponent(service.name)}#contact-form`"
            color="primary"
            class="flex-1"
          >
            Замовити
          </UButton>

          <UButton
            :to="`/services/${service.id}`"
            color="neutral"
            variant="outline"
            class="flex-1"
          >
            Детальніше
          </UButton>

        </div>
      </UCard>
    </section>

  </div>
</template>