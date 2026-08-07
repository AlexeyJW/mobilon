<script setup lang="ts">
const element = ref<HTMLElement | null>(null)
const isVisible = ref(false)

let observer: IntersectionObserver | null = null

onMounted(() => {
  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        isVisible.value = true

        observer?.unobserve(entry.target)
      }
    },
    {
      threshold: 0.15
    }
  )

  if (element.value) {
    observer.observe(element.value)
  }
})

onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>

<template>
  <div
    ref="element"
    :class="[
      'transition-all duration-700',
      isVisible
        ? 'opacity-100 translate-y-0'
        : 'opacity-0 translate-y-8'
    ]"
  >
    <slot />
  </div>
</template>