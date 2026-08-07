<script setup lang="ts">
const imageUrl = defineModel<string>('imageUrl')
const imageId = defineModel<string>('imageId')

const uploading = ref(false)
const dragActive = ref(false)

async function upload(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  uploading.value = true

  try {
    const result = await $fetch<{
      imageUrl: string
      imageId: string
    }>('/api/upload', {
      method: 'POST',
      body: formData
    })

    imageUrl.value = result.imageUrl
    imageId.value = result.imageId
  } finally {
    uploading.value = false
  }
}

async function onSelect(event: Event) {
  const target = event.target as HTMLInputElement

  if (!target.files?.length) return

  await upload(target.files[0])
}

async function removeImage() {
  if (!imageId.value) return

  uploading.value = true

  try {
    await $fetch('/api/upload', {
      method: 'DELETE',
      body: {
        imageId: imageId.value
      }
    })

    imageUrl.value = ''
    imageId.value = ''
  } finally {
    uploading.value = false
  }
}

async function onDrop(event: DragEvent) {
  event.preventDefault()

  dragActive.value = false

  const file = event.dataTransfer?.files?.[0]

  if (!file) return

  await upload(file)
}

function onDragOver(event: DragEvent) {
  event.preventDefault()
  dragActive.value = true
}

function onDragLeave() {
  dragActive.value = false
}
</script>

<template>
  <div class="space-y-4">
    <label
      class="relative block overflow-hidden rounded-2xl border-2 border-dashed transition-all cursor-pointer"
      :class="dragActive
        ? 'border-primary bg-primary/5'
        : 'border-default hover:border-primary'"
      @drop="onDrop"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
    >
      <input
        hidden
        type="file"
        accept="image/*"
        @change="onSelect"
      >

      <div
        v-if="imageUrl"
        class="relative h-72"
      >
        <img
          :src="imageUrl"
          class="w-full h-full object-cover"
        >

        <div
          class="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition flex items-center justify-center gap-3"
        >
          <UButton
            icon="i-lucide-refresh-cw"
            color="primary"
            variant="solid"
          >
            Замінити
          </UButton>

          <UButton
            icon="i-lucide-trash-2"
            color="error"
            @click.stop.prevent="removeImage"
          >
            Видалити
          </UButton>
        </div>
      </div>

      <div
        v-else
        class="h-72 flex flex-col items-center justify-center gap-4"
      >
        <UIcon
          name="i-lucide-image-plus"
          class="text-6xl text-primary"
        />

        <div class="text-center">
          <p class="font-semibold">
            Перетягніть фото сюди
          </p>

          <p class="text-sm text-muted">
            або натисніть для вибору файлу
          </p>
        </div>
      </div>
    </label>

    <UProgress
      v-if="uploading"
      animation="carousel"
    />
  </div>
</template>