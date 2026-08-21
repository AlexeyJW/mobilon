<script setup lang="ts">
interface Service {
  id: number
  name: string
  description: string | null
  price: string | number
  category: string | null
  image: string | null
}

const route = useRoute()

const { data, error } = await useFetch<{
  success: boolean
  service: Service
}>(`/api/admin/services/${route.params.id}`)

if (error.value || !data.value?.service) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Послугу не знайдено'
  })
}

const service = computed(() => data.value!.service)
</script>

<template>
  <div class="px-4 py-10 bg-default min-h-screen">
    <div class="max-w-5xl mx-auto">

      <UButton
        to="/services"
        icon="i-lucide-arrow-left"
        color="neutral"
        variant="ghost"
        class="mb-8"
      >
        Назад до послуг
      </UButton>

      <UCard class="overflow-hidden bg-elevated border-border">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">

          <!-- Фото -->
          <div class="aspect-[4/3] rounded-2xl overflow-hidden bg-muted">
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
                class="w-24 h-24"
              />
            </div>
          </div>

          <!-- Інформація -->
          <div class="flex flex-col">

            <UBadge
              v-if="service.category"
              color="primary"
              variant="soft"
              class="self-start mb-4"
            >
              {{ service.category }}
            </UBadge>

            <h1 class="text-3xl md:text-4xl font-black text-default">
              {{ service.name }}
            </h1>

            <p class="text-muted text-lg leading-relaxed mt-5">
              {{ service.description }}
            </p>

            <div class="mt-auto pt-8">

              <div class="text-2xl font-bold text-default mb-5">
                {{ Number(service.price).toLocaleString('uk-UA') }} грн
              </div>

              <UButton
                 :to="`/?service=${encodeURIComponent(service.name)}#contact-form`"
                size="xl"
                block
              >
                Замовити послугу
              </UButton>

            </div>
          </div>

        </div>
      </UCard>

    </div>
  </div>
</template>