
<script setup lang="ts">
interface PriceService {
  id: number
  name: string
  description: string | null
  price: string | number
  priceFrom: boolean
}

interface PriceCategory {
  id: number
  name: string
  services: PriceService[]
}

const {
  data,
  pending,
  error,
  refresh
} = await useFetch<{
  success: boolean
  categories: PriceCategory[]
}>('/api/price', {
  method: 'GET'
})

const categories = computed(() => {
  return data.value?.categories || []
})

function formatPrice(
  price: string | number,
  priceFrom = false
) {
  const value = Number(price)

  const formatted = value.toLocaleString('uk-UA')

  return priceFrom
    ? `від ${formatted} грн`
    : `${formatted} грн`
}

useSeoMeta({
  title: 'Прайс на послуги — Mobilon',
  description:
    'Актуальні ціни на ремонт телефонів, поклейку скла та плівки, налаштування смартфонів, перенесення даних, друк та інші послуги Mobilon.',
  ogTitle: 'Прайс на послуги — Mobilon',
  ogDescription:
    'Актуальні ціни на послуги Mobilon.',
  ogType: 'website'
})
</script>

<template>
  <div
    class="min-h-screen bg-default text-default"
  >

   


    <!-- ==========================================
         CONTENT
    =========================================== -->

    <main
      class="mx-auto max-w-3xl px-4 pb-16 pt-8"
    >

      <!-- HERO -->

      <section
        class="mb-8 text-center"
      >

        <UBadge
          color="primary"
          variant="soft"
          size="lg"
          class="mb-4"
        >
          Актуальний прайс
        </UBadge>

        <h1
          class="text-3xl font-black tracking-tight sm:text-4xl"
        >
          Послуги Mobilon
        </h1>

        <p
          class="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted sm:text-base"
        >
          Ремонт, поклейка скла та плівки,
          налаштування смартфонів, перенесення даних
          та інші послуги.
        </p>

      </section>

      <!-- ========================================
           LOADING
      ========================================= -->

      <div
        v-if="pending"
        class="space-y-4"
      >

        <UCard
          v-for="i in 4"
          :key="i"
          class="animate-pulse"
        >

          <div
            class="h-6 w-1/2 rounded bg-elevated"
          />

          <div class="mt-5 space-y-3">

            <div
              class="h-12 rounded-lg bg-elevated"
            />

            <div
              class="h-12 rounded-lg bg-elevated"
            />

            <div
              class="h-12 rounded-lg bg-elevated"
            />

          </div>

        </UCard>

      </div>

      <!-- ========================================
           ERROR
      ========================================= -->

      <UCard
        v-else-if="error"
        class="border-error/30"
      >

        <div
          class="py-8 text-center"
        >

          <Icon
            name="i-lucide-circle-alert"
            class="mx-auto mb-3 h-10 w-10 text-error"
          />

          <h2
            class="font-bold"
          >
            Не вдалося завантажити прайс
          </h2>

          <p
            class="mt-2 text-sm text-muted"
          >
            Спробуйте оновити сторінку.
          </p>

          <UButton
            class="mt-5"
            color="primary"
            @click="refresh()"
          >
            Оновити
          </UButton>

        </div>

      </UCard>

      <!-- ========================================
           EMPTY
      ========================================= -->

      <UCard
        v-else-if="!categories.length"
      >

        <div
          class="py-10 text-center"
        >

          <Icon
            name="i-lucide-receipt"
            class="mx-auto mb-3 h-10 w-10 text-muted"
          />

          <p class="text-muted">
            Прайс поки порожній.
          </p>

        </div>

      </UCard>

      <!-- ========================================
           PRICE
      ========================================= -->

      <div
        v-else
        class="space-y-5"
      >

        <section
          v-for="category in categories"
          :key="category.id"
          class="overflow-hidden rounded-2xl border border-border bg-elevated shadow-sm"
        >

          <!-- CATEGORY HEADER -->

          <div
            class="flex items-center gap-3 border-b border-border px-4 py-4 sm:px-5"
          >

            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
            >

              <Icon
                name="i-lucide-wrench"
                class="h-5 w-5"
              />

            </div>

            <div class="min-w-0">

              <h2
                class="text-base font-black uppercase tracking-wide sm:text-lg"
              >
                {{ category.name }}
              </h2>

              <p
                class="mt-0.5 text-xs text-muted"
              >
                {{ category.services.length }}
                {{
                  category.services.length === 1
                    ? 'послуга'
                    : category.services.length < 5
                      ? 'послуги'
                      : 'послуг'
                }}
              </p>

            </div>

          </div>

          <!-- SERVICES -->

          <div>

            <div
              v-for="(service, index) in category.services"
              :key="service.id"
              class="px-4 sm:px-5"
            >

              <div
                class="flex items-start justify-between gap-4 py-4"
              >

                <!-- INFO -->

                <div
                  class="min-w-0 flex-1"
                >

                  <h3
                    class="font-semibold leading-5"
                  >
                    {{ service.name }}
                  </h3>

                  <p
                    v-if="service.description"
                    class="mt-1.5 text-xs leading-5 text-muted"
                  >
                    {{ service.description }}
                  </p>

                </div>

                <!-- PRICE -->

                <div
                  class="shrink-0 text-right"
                >

                  <div
                    class="whitespace-nowrap text-base font-black text-primary sm:text-lg"
                  >
                    {{
                      formatPrice(
                        service.price,
                        service.priceFrom
                      )
                    }}
                  </div>

                </div>

              </div>

              <div
                v-if="
                  index <
                  category.services.length - 1
                "
                class="border-b border-border"
              />

            </div>

          </div>

        </section>

      </div>

      <!-- ========================================
           INFO
      ========================================= -->

      <section
        class="mt-8 rounded-2xl border border-border bg-elevated p-5 text-center"
      >

        <Icon
          name="i-lucide-info"
          class="mx-auto h-7 w-7 text-primary"
        />

        <h2
          class="mt-3 font-bold"
        >
          Потрібна консультація?
        </h2>

        <p
          class="mt-1 text-sm leading-5 text-muted"
        >
          Якщо не знайшли потрібну послугу —
          зверніться до нас. Ми підкажемо
          орієнтовну вартість.
        </p>

        <div
          class="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center"
        >

          <UButton
            to="/#contact-form"
            color="primary"
            icon="i-lucide-message-circle"
          >
            Залишити заявку
          </UButton>

          <UButton
            to="/"
            color="neutral"
            variant="outline"
            icon="i-lucide-home"
          >
            На головну
          </UButton>

        </div>

      </section>

      <!-- FOOTER -->

      <footer
        class="mt-8 text-center text-xs text-muted"
      >

        <p>
          Mobilon · сучасні мобільні технології
        </p>

        <p class="mt-1">
          Ціни можуть змінюватися залежно від моделі
          пристрою та складності роботи.
        </p>

      </footer>

    </main>

  </div>
</template>

