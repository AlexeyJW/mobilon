<script setup lang="ts">
useSeoMeta({
  title: 'Про Mobilon — магазин смартфонів та аксесуарів у Солотвині',

  description:
    'Mobilon — магазин смартфонів та аксесуарів у Солотвині. Допоможемо обрати смартфон, підібрати чохол, захисне скло, зарядку та налаштувати новий пристрій.',

  ogTitle:
    'Про Mobilon — магазин смартфонів та аксесуарів у Солотвині',

  ogDescription:
    'Смартфони, аксесуари та допомога з мобільною технікою у Солотвині. Дізнайтеся більше про магазин Mobilon.',

  ogType: 'website',

  ogUrl: 'https://mobilon.com.ua/about',

  ogImage: 'https://mobilon.com.ua/images/og-image.png',

  twitterCard: 'summary_large_image',

  twitterTitle:
    'Про Mobilon — магазин смартфонів та аксесуарів у Солотвині',

  twitterDescription:
    'Смартфони, аксесуари та допомога з мобільною технікою у Солотвині.'
})

useHead({
  link: [
    {
      rel: 'canonical',
      href: 'https://mobilon.com.ua/about'
    }
  ]
})


interface TeamMember {
  id: number
  name: string
  role: 'ADMIN' | 'MANAGER'
  photo: string | null
  position: string | ''
}

const team = ref<TeamMember[]>([])

async function loadTeam() {
  try {
    const result = await $fetch<{
      success: boolean
      users: TeamMember[]
    }>('/api/team')

    team.value = result.users
  } catch (error) {
    console.error('Failed to load team:', error)
  }
}

onMounted(loadTeam)
</script>

<template>
  <div class="px-4 py-10 space-y-20 bg-default">

    <RevealOnScroll>
      <AboutHero />
    </RevealOnScroll>

    <RevealOnScroll>
      <StoreGallery />
    </RevealOnScroll>

    <AboutStore />

    <!-- TEAM -->
    <RevealOnScroll>
      <section
        v-if="team.length"
        class="space-y-8"
      >
        <div class="text-center space-y-2">
          <h2 class="text-3xl font-bold text-default">
            Наша команда
          </h2>

          <p class="text-muted max-w-2xl mx-auto">
            Люди, які допомагають вам обрати техніку
            та отримати необхідну допомогу в Mobilon.
          </p>

          <div
            class="w-20 h-1 bg-primary mx-auto rounded-full"
          />
        </div>

        <div
          class="
            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-3
            xl:grid-cols-4
            gap-5
          "
        >
          <UCard
            v-for="member in team"
            :key="member.id"
            class="
              bg-elevated
              border-border
              overflow-hidden
              hover:shadow-lg
              transition-all
              duration-300
            "
          >
            <div class="space-y-4">

              <div
                class="
                  aspect-square
                  rounded-2xl
                  overflow-hidden
                  bg-primary/10
                "
              >
                <img
                  v-if="member.photo"
                  :src="member.photo"
                  :alt="member.name"
                  class="w-full h-full object-cover"
                  loading="lazy"
                >

                <div
                  v-else
                  class="
                    w-full
                    h-full
                    flex
                    items-center
                    justify-center
                    text-primary
                  "
                >
                  <Icon
                    name="i-lucide-user"
                    class="w-20 h-20"
                  />
                </div>
              </div>

              <div class="text-center">
                <h3 class="text-lg font-bold text-default">
                  {{ member.name }}
                </h3>

                <p class="text-sm text-primary mt-1">
                  {{ member.position }}
                </p>
              </div>

            </div>
          </UCard>
        </div>
      </section>
    </RevealOnScroll>

    <AboutBenefits />

    <AboutFaq />

    <AboutCta />

  </div>
</template>