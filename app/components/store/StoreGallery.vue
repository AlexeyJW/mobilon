<script setup lang="ts">
interface StorePhoto {
  id: number
  title: string | null
  description: string | null
  imageUrl: string
  publicId: string | null
  sortOrder: number
  isActive: boolean
}

const photos = ref<StorePhoto[]>([])
const loading = ref(true)

const selectedPhoto = ref<StorePhoto | null>(null)
const isPreviewOpen = ref(false)

async function loadPhotos() {
  try {
    const result = await $fetch<StorePhoto[]>('/api/store-photos')

    photos.value = result.filter(photo => photo.isActive)
  } catch (error) {
    console.error('Store gallery error:', error)
  } finally {
    loading.value = false
  }
}

function openPreview(photo: StorePhoto) {
  selectedPhoto.value = photo
  isPreviewOpen.value = true
}

onMounted(loadPhotos)
</script>

<template>
  <section
    v-if="loading || photos.length"
    class="space-y-6"
  >

    <!-- HEADER -->
    <div class="text-center space-y-2">

      <h2 class="text-3xl font-bold text-default">
        Наш магазин
      </h2>

      <div class="w-20 h-1 bg-primary mx-auto rounded-full" />

      <p class="text-muted max-w-2xl mx-auto">
        Завітайте до нас — будемо раді допомогти
        та особисто відповісти на ваші запитання.
      </p>

    </div>


    <!-- GALLERY -->
    <div
      v-if="photos.length"
      class="relative"
    >

      <div
        class="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4
               scrollbar-thin scrollbar-thumb-muted
               touch-pan-x"
      >

        <button
          v-for="photo in photos"
          :key="photo.id"
          type="button"
          class="group relative shrink-0
                 w-[82vw] sm:w-[420px] lg:w-[480px]
                 aspect-[4/3]
                 overflow-hidden rounded-3xl
                 border border-border
                 bg-elevated
                 snap-center
                 text-left
                 focus:outline-none
                 focus:ring-2
                 focus:ring-primary"
          @click="openPreview(photo)"
        >

          <img
            :src="photo.imageUrl"
            :alt="photo.title || 'Магазин Mobilon'"
            class="w-full h-full object-cover
                   transition duration-500
                   group-hover:scale-105"
            loading="lazy"
          >

          <!-- OVERLAY -->
          <div
            class="absolute inset-0
                   bg-gradient-to-t
                   from-black/70
                   via-black/10
                   to-transparent
                   opacity-0
                   group-hover:opacity-100
                   transition-opacity"
          />

          <!-- TEXT -->
          <div
            v-if="photo.title || photo.description"
            class="absolute bottom-0 left-0 right-0
                   p-5 text-white
                   opacity-0
                   group-hover:opacity-100
                   transition-opacity"
          >

            <h3
              v-if="photo.title"
              class="font-semibold text-lg"
            >
              {{ photo.title }}
            </h3>

            <p
              v-if="photo.description"
              class="text-sm text-white/80 mt-1"
            >
              {{ photo.description }}
            </p>

          </div>

          <!-- ZOOM ICON -->
          <div
            class="absolute top-4 right-4
                   w-10 h-10
                   rounded-full
                   bg-black/40
                   backdrop-blur
                   flex items-center justify-center
                   text-white
                   opacity-0
                   group-hover:opacity-100
                   transition-opacity"
          >
            <UIcon
              name="i-lucide-maximize-2"
              class="w-5 h-5"
            />
          </div>

        </button>

      </div>


      <!-- SCROLL HINT -->
      <div
        v-if="photos.length > 1"
        class="flex items-center justify-center gap-2
               text-sm text-muted"
      >

        <UIcon
          name="i-lucide-move-horizontal"
          class="w-4 h-4"
        />

        <span>
          Гортайте, щоб переглянути більше
        </span>

      </div>

    </div>

  </section>


  <!-- FULLSCREEN PREVIEW -->
  <UModal v-model:open="isPreviewOpen">

    <template #content>

      <div
        v-if="selectedPhoto"
        class="relative bg-black rounded-2xl overflow-hidden"
      >

        <img
          :src="selectedPhoto.imageUrl"
          :alt="selectedPhoto.title || 'Магазин Mobilon'"
          class="w-full max-h-[85vh] object-contain"
        >

        <UButton
          icon="i-lucide-x"
          color="neutral"
          variant="solid"
          class="absolute top-4 right-4"
          @click="isPreviewOpen = false"
        />

        <div
          v-if="selectedPhoto.title || selectedPhoto.description"
          class="absolute bottom-0 left-0 right-0
                 bg-gradient-to-t
                 from-black/80
                 to-transparent
                 p-6 pt-16 text-white"
        >

          <h3
            v-if="selectedPhoto.title"
            class="text-xl font-bold"
          >
            {{ selectedPhoto.title }}
          </h3>

          <p
            v-if="selectedPhoto.description"
            class="text-white/80 mt-1"
          >
            {{ selectedPhoto.description }}
          </p>

        </div>

      </div>

    </template>

  </UModal>
</template>