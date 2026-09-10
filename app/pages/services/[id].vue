<script setup lang="ts">
interface Service {
  id: number
  name: string
  slug: string | null
  description: string | null

  seoText: string | null
  duration: string | null
  whatIncluded: string | null
  metaTitle: string | null
  metaDescription: string | null

  price: string | number
  image: string | null
  priceFrom: boolean
  sortOrder: number
  category: string | null
  categoryId: number | null

  categoryRef?: {
    id: number
    name: string
  } | null

  active: boolean
  createdAt: string
  updatedAt: string
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
const routeParam = String(route.params.id)

if (/^\d+$/.test(routeParam) && service.value.slug) {
  await navigateTo(`/services/${service.value.slug}`, {
    redirectCode: 301
  })
}
// SEO meta
useSeoMeta({
  title: () => {
    if (!service.value) {
      return 'Послуга | Mobilon'
    }

    return (
      service.value.metaTitle ||
      `${service.value.name} у Солотвині | Mobilon`
    )
  },

  description: () => {
    if (!service.value) {
      return 'Послуги Mobilon у Солотвині'
    }

    if (service.value.metaDescription) {
      return service.value.metaDescription
    }

    const price = Number(service.value.price)

    return `${service.value.name} у Солотвині. ${
      service.value.description ?? ''
    } Вартість ${
      service.value.priceFrom ? 'від ' : ''
    }${price} грн. Mobilon.`
  },

  ogTitle: () => {
    if (!service.value) {
      return 'Mobilon'
    }

    return (
      service.value.metaTitle ||
      `${service.value.name} | Mobilon`
    )
  },

  ogDescription: () =>
    service.value?.metaDescription ||
    service.value?.description ||
    'Послуги Mobilon у Солотвині',

  ogImage: () => service.value?.image ?? ''
})

useHead(() => {
  if (!service.value || !service.value.slug) {
    return {}
  }

  const price = Number(service.value.price)

  return {
    script: [
      {
        type: 'application/ld+json',

        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Service',

          name: service.value.name,

          description:
            service.value.description ??
            `${service.value.name} у магазині Mobilon у Солотвині`,

          url: `https://mobilon.com.ua/services/${service.value.slug}`,

          image: service.value.image || undefined,

        provider: {
          '@type': 'LocalBusiness',
          name: 'Mobilon',
          url: 'https://mobilon.com.ua',
          telephone: '+380984455233',

          address: {
            '@type': 'PostalAddress',
            streetAddress: 'вул. Дружби Народів, 3',
            addressLocality: 'Солотвино',
            addressRegion: 'Закарпатська область',
            addressCountry: 'UA'
          }
        },

          areaServed: {
            '@type': 'Place',
            name: 'Солотвино, Закарпатська область, Україна'
          },

          offers: {
            '@type': 'Offer',
            priceCurrency: 'UAH',
            price: price,
            url: `https://mobilon.com.ua/services/${service.value.slug}`,
            availability: 'https://schema.org/InStock'
          }
        })
      }
    ]
  }
})


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
            v-if="service.categoryRef?.name || service.category"
            color="primary"
            variant="soft"
            class="self-start mb-4"
          >
            {{ service.categoryRef?.name || service.category }}
          </UBadge>

            <h1 class="text-3xl md:text-4xl font-black text-default">
              {{ service.name }}
            </h1>

            <p class="text-muted text-lg leading-relaxed mt-5">
              {{ service.description }}
            </p>

            <div class="mt-auto pt-8">

              <div class="text-2xl font-bold text-default mb-5">
                {{ service.priceFrom ? 'від ' : '' }}
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
<div
  v-if="service.seoText || service.duration || service.whatIncluded"
  class="mt-10 space-y-8"
>

  <!-- Детальний опис -->
  <section v-if="service.seoText">
    <h2 class="text-2xl font-bold text-default mb-4">
      Про послугу
    </h2>

    <p class="text-muted leading-7 whitespace-pre-line">
      {{ service.seoText }}
    </p>
  </section>

  <!-- Тривалість -->
  <section v-if="service.duration">
    <UCard>
      <div class="flex gap-4 items-start">

        <div
          class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10"
        >
          <UIcon
            name="i-lucide-clock"
            class="size-5 text-primary"
          />
        </div>

        <div>
          <h2 class="font-bold text-lg text-default">
            Скільки часу займає
          </h2>

          <p class="mt-1 text-muted">
            {{ service.duration }}
          </p>
        </div>

      </div>
    </UCard>
  </section>

  <!-- Що входить -->
  <section v-if="service.whatIncluded">
    <h2 class="text-2xl font-bold text-default mb-4">
      Що входить у послугу
    </h2>

    <div class="text-muted leading-7 whitespace-pre-line">
      {{ service.whatIncluded }}
    </div>
  </section>

</div>
    </div>
  </div>
</template>