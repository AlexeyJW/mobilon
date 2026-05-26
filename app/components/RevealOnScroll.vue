<script setup>
const isVisible = ref(false)

const element = ref(null)

onMounted(() => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        isVisible.value = true
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
</script>

<template>
  <div
    ref="element"
    :class="[
      'transition-all duration-700 ease-out',
      isVisible
        ? 'opacity-100 translate-y-0'
        : 'opacity-0 translate-y-10'
    ]"
  >
    <slot />
  </div>
</template>