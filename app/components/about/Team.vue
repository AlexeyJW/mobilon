<script setup lang="ts">
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
  <RevealOnScroll>
    <section
      v-if="team.length"
      class="max-w-6xl mx-auto"
    >
      <div class="text-center mb-10">
        <p
          class="text-sm font-semibold uppercase tracking-wider text-primary mb-2"
        >
          Наша команда
        </p>

        <h2 class="text-2xl md:text-3xl font-bold">
          Люди, які працюють у Mobilon
        </h2>

        <p
          class="mt-3 text-muted max-w-2xl mx-auto"
        >
          Люди, які допомагають вам обрати техніку
          та отримати необхідну допомогу в Mobilon.
        </p>
      </div>

      <div
        class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 justify-center"
      >
        <div
          v-for="member in team"
          :key="member.id"
          class="rounded-2xl border border-default bg-elevated overflow-hidden"
        >
          <div class="aspect-[4/3] bg-muted overflow-hidden">
            <img
              v-if="member.photo"
              :src="member.photo"
              :alt="member.name"
              class="w-full h-full object-cover"
              loading="lazy"
            >

            <div
              v-else
              class="w-full h-full flex items-center justify-center text-muted"
            >
              Фото
            </div>
          </div>

          <div class="p-5 text-center">
            <h3 class="text-lg font-semibold">
              {{ member.name }}
            </h3>

            <p
              v-if="member.position"
              class="mt-1 text-sm text-muted"
            >
              {{ member.position }}
            </p>
          </div>
        </div>
      </div>
    </section>
  </RevealOnScroll>
</template>