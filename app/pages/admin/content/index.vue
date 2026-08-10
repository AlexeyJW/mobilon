<script setup lang="ts">
interface StorePhoto {
  id: number
  title: string | null
  description: string | null
  imageUrl: string
  publicId: string | null
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const toast = useToast()

const photos = ref<StorePhoto[]>([])
const loading = ref(false)
const uploading = ref(false)

const isModalOpen = ref(false)
const isDeleteModalOpen = ref(false)

const editingPhoto = ref<StorePhoto | null>(null)
const deletingPhoto = ref<StorePhoto | null>(null)

const form = reactive({
  title: '',
  description: '',
  sortOrder: 0,
  isActive: true,
  imageUrl: '',
  publicId: ''
})

async function loadPhotos() {
  loading.value = true

  try {
    photos.value = await $fetch<StorePhoto[]>('/api/store-photos')
  } catch (error) {
    console.error(error)

    toast.add({
      title: 'Помилка',
      description: 'Не вдалося завантажити фотографії',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

function openCreateModal() {
  editingPhoto.value = null

  form.title = ''
  form.description = ''
  form.sortOrder = photos.value.length + 1
  form.isActive = true
  form.imageUrl = ''
  form.publicId = ''

  isModalOpen.value = true
}

function openEditModal(photo: StorePhoto) {
  editingPhoto.value = photo

  form.title = photo.title ?? ''
  form.description = photo.description ?? ''
  form.sortOrder = photo.sortOrder
  form.isActive = photo.isActive
  form.imageUrl = photo.imageUrl
  form.publicId = photo.publicId ?? ''

  isModalOpen.value = true
}

async function uploadPhoto(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) {
    return
  }

  uploading.value = true

  try {
    const formData = new FormData()
    formData.append('file', file)

    const result = await $fetch<{
      imageUrl: string
      publicId: string
      width: number
      height: number
    }>('/api/store-photos/upload', {
      method: 'POST',
      body: formData
    })

    form.imageUrl = result.imageUrl
    form.publicId = result.publicId

    toast.add({
      title: 'Фото завантажено',
      description: 'Тепер можна зберегти фотографію',
      color: 'success'
    })
  } catch (error) {
    console.error(error)

    toast.add({
      title: 'Помилка',
      description: 'Не вдалося завантажити фото',
      color: 'error'
    })
  } finally {
    uploading.value = false

    input.value = ''
  }
}

async function savePhoto() {
  if (!form.imageUrl) {
    toast.add({
      title: 'Оберіть фото',
      description: 'Спочатку потрібно завантажити фотографію',
      color: 'warning'
    })

    return
  }

  try {
    if (editingPhoto.value) {
      await $fetch(`/api/store-photos/${editingPhoto.value.id}`, {
        method: 'PUT',
        body: {
          title: form.title || null,
          description: form.description || null,
          sortOrder: Number(form.sortOrder),
          isActive: form.isActive,
          imageUrl: form.imageUrl,
          publicId: form.publicId || null
        }
      })

      toast.add({
        title: 'Збережено',
        description: 'Фотографію оновлено',
        color: 'success'
      })
    } else {
      await $fetch('/api/store-photos', {
        method: 'POST',
        body: {
          title: form.title || null,
          description: form.description || null,
          sortOrder: Number(form.sortOrder),
          isActive: form.isActive,
          imageUrl: form.imageUrl,
          publicId: form.publicId || null
        }
      })

      toast.add({
        title: 'Додано',
        description: 'Фотографію додано до галереї',
        color: 'success'
      })
    }

    isModalOpen.value = false

    await loadPhotos()
  } catch (error) {
    console.error(error)

    toast.add({
      title: 'Помилка',
      description: 'Не вдалося зберегти фотографію',
      color: 'error'
    })
  }
}

function confirmDelete(photo: StorePhoto) {
  deletingPhoto.value = photo
  isDeleteModalOpen.value = true
}

async function deletePhoto() {
  if (!deletingPhoto.value) {
    return
  }

  try {
    await $fetch(`/api/store-photos/${deletingPhoto.value.id}`, {
      method: 'DELETE'
    })

    toast.add({
      title: 'Видалено',
      description: 'Фотографію видалено',
      color: 'success'
    })

    isDeleteModalOpen.value = false
    deletingPhoto.value = null

    await loadPhotos()
  } catch (error) {
    console.error(error)

    toast.add({
      title: 'Помилка',
      description: 'Не вдалося видалити фотографію',
      color: 'error'
    })
  }
}

onMounted(() => {
  loadPhotos()
})
</script>

<template>
  <div class="space-y-8">

    <!-- HEADER -->
    <UiPageHeader
      title="Редагування контенту"
      description="Керуйте інформацією та фотографіями, які відображаються на сайті"
    />

    <!-- STORE PHOTOS -->
    <section class="space-y-6">

      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div>
          <h2 class="text-2xl font-bold text-default">
            Фото магазину
          </h2>

          <p class="text-muted mt-1">
            Фотографії для галереї на сторінці «Про нас»
          </p>
        </div>

        <UButton
          icon="i-lucide-plus"
          color="primary"
          @click="openCreateModal"
        >
          Додати фото
        </UButton>

      </div>

      <!-- LOADING -->
      <div
        v-if="loading"
        class="flex justify-center py-12"
      >
        <UIcon
          name="i-lucide-loader-circle"
          class="text-3xl animate-spin text-primary"
        />
      </div>

      <!-- EMPTY -->
      <UCard
        v-else-if="!photos.length"
        class="bg-elevated border-border"
      >
        <div class="py-12 text-center space-y-4">

          <UIcon
            name="i-lucide-images"
            class="text-5xl text-muted mx-auto"
          />

          <div>
            <h3 class="text-lg font-semibold text-default">
              Фотографій поки немає
            </h3>

            <p class="text-muted mt-1">
              Додайте перші фотографії магазину
            </p>
          </div>

          <UButton
            icon="i-lucide-plus"
            color="primary"
            @click="openCreateModal"
          >
            Додати перше фото
          </UButton>

        </div>
      </UCard>

      <!-- PHOTOS -->
      <div
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      >

        <UCard
          v-for="photo in photos"
          :key="photo.id"
          class="overflow-hidden bg-elevated border-border"
        >

          <div class="aspect-video bg-muted overflow-hidden">
            <img
              :src="photo.imageUrl"
              :alt="photo.title || 'Фото магазину Mobilon'"
              class="w-full h-full object-cover"
            >
          </div>

          <div class="p-4 space-y-4">

            <div class="flex items-start justify-between gap-3">

              <div class="min-w-0">
                <h3 class="font-semibold text-default truncate">
                  {{ photo.title || 'Без назви' }}
                </h3>

                <p
                  v-if="photo.description"
                  class="text-sm text-muted mt-1 line-clamp-2"
                >
                  {{ photo.description }}
                </p>
              </div>

              <UBadge
                :color="photo.isActive ? 'success' : 'neutral'"
                variant="soft"
              >
                {{ photo.isActive ? 'Активне' : 'Вимкнене' }}
              </UBadge>

            </div>

            <div class="flex items-center justify-between text-sm">

              <span class="text-muted">
                Порядок:
              </span>

              <span class="font-semibold text-default">
                {{ photo.sortOrder }}
              </span>

            </div>

            <div class="flex gap-2">

              <UButton
                icon="i-lucide-pencil"
                color="warning"
                variant="soft"
                size="sm"
                class="flex-1"
                @click="openEditModal(photo)"
              >
                Редагувати
              </UButton>

              <UButton
                icon="i-lucide-trash"
                color="error"
                variant="soft"
                size="sm"
                @click="confirmDelete(photo)"
              />

            </div>

          </div>

        </UCard>

      </div>

    </section>

    <!-- ADD / EDIT MODAL -->
    <UModal v-model:open="isModalOpen">

      <template #content>

        <UCard class="bg-elevated">

          <template #header>
            <div class="flex items-center justify-between">

              <div>
                <h3 class="text-xl font-bold text-default">
                  {{ editingPhoto ? 'Редагувати фото' : 'Додати фото' }}
                </h3>

                <p class="text-sm text-muted mt-1">
                  Фото магазину для сторінки «Про нас»
                </p>
              </div>

              <UButton
                icon="i-lucide-x"
                color="neutral"
                variant="ghost"
                @click="isModalOpen = false"
              />

            </div>
          </template>

          <div class="space-y-5">

            <!-- UPLOAD -->
            <div class="space-y-3">

              <label class="text-sm font-medium text-default">
                Фотографія
              </label>

              <div
                v-if="form.imageUrl"
                class="relative rounded-2xl overflow-hidden border border-border"
              >

                <img
                  :src="form.imageUrl"
                  alt="Preview"
                  class="w-full aspect-video object-cover"
                />

                <div class="absolute top-3 right-3">

                  <UButton
                    icon="i-lucide-refresh-cw"
                    color="neutral"
                    variant="solid"
                    size="sm"
                    :loading="uploading"
                    as="label"
                  >
                    Змінити

                    <input
                      type="file"
                      accept="image/*"
                      class="hidden"
                      @change="uploadPhoto"
                    >
                  </UButton>

                </div>

              </div>

              <label
                v-else
                class="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border p-8 cursor-pointer hover:bg-muted/40 transition"
              >

                <UIcon
                  name="i-lucide-upload"
                  class="text-4xl text-muted"
                />

                <div class="text-center">

                  <p class="font-medium text-default">
                    {{ uploading ? 'Завантаження...' : 'Виберіть фотографію' }}
                  </p>

                  <p class="text-sm text-muted mt-1">
                    JPG, PNG або WebP
                  </p>

                </div>

                <input
                  type="file"
                  accept="image/*"
                  class="hidden"
                  :disabled="uploading"
                  @change="uploadPhoto"
                >

              </label>

            </div>

            <!-- TITLE -->
            <UFormField label="Назва">
              <UInput
                v-model="form.title"
                placeholder="Наприклад: Наш магазин"
                class="w-full"
              />
            </UFormField>

            <!-- DESCRIPTION -->
            <UFormField label="Опис">
              <UTextarea
                v-model="form.description"
                placeholder="Короткий опис фотографії"
                :rows="3"
                class="w-full"
              />
            </UFormField>

            <!-- ORDER + ACTIVE -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <UFormField label="Порядок">
                <UInput
                  v-model.number="form.sortOrder"
                  type="number"
                  min="0"
                  class="w-full"
                />
              </UFormField>

              <UFormField label="Статус">
                <div class="flex items-center h-10">
                  <USwitch
                    v-model="form.isActive"
                    label="Показувати на сайті"
                  />
                </div>
              </UFormField>

            </div>

          </div>

          <template #footer>

            <div class="flex justify-end gap-3">

              <UButton
                color="neutral"
                variant="soft"
                @click="isModalOpen = false"
              >
                Скасувати
              </UButton>

              <UButton
                color="primary"
                :loading="uploading"
                :disabled="!form.imageUrl"
                @click="savePhoto"
              >
                {{ editingPhoto ? 'Зберегти' : 'Додати фото' }}
              </UButton>

            </div>

          </template>

        </UCard>

      </template>

    </UModal>

    <!-- DELETE MODAL -->
    <UModal v-model:open="isDeleteModalOpen">

      <template #content>

        <UCard class="bg-elevated">

          <template #header>
            <h3 class="text-xl font-bold text-default">
              Видалення фотографії
            </h3>
          </template>

          <div class="space-y-3">

            <p class="text-default">
              Ви дійсно хочете видалити
              <strong>
                {{ deletingPhoto?.title || 'цю фотографію' }}
              </strong>
              ?
            </p>

            <p class="text-sm text-muted">
              Фотографія буде видалена з галереї.
            </p>

          </div>

          <template #footer>

            <div class="flex justify-end gap-3">

              <UButton
                color="neutral"
                variant="soft"
                @click="isDeleteModalOpen = false"
              >
                Скасувати
              </UButton>

              <UButton
                color="error"
                icon="i-lucide-trash"
                @click="deletePhoto"
              >
                Видалити
              </UButton>

            </div>

          </template>

        </UCard>

      </template>

    </UModal>

  </div>
</template>