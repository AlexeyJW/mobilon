<!-- components/ThemeToggle.vue -->
<template>
  <ClientOnly>
    <UButton
      :icon="isDark ? 'i-lucide-sun' : 'i-lucide-moon'"
      :color="isDark ? 'yellow' : 'blue'"
      variant="solid"
      size="sm"
      class="theme-toggle-btn"
      @click="toggleTheme"
    >
      <span class="hidden sm:inline ml-1">
        {{ isDark ? 'Світла' : 'Темна' }}
      </span>
    </UButton>
  </ClientOnly>
</template>

<script setup>
const colorMode = useColorMode()

const isDark = ref(false)

onMounted(() => {
  isDark.value = colorMode.value === 'dark'
})

const toggleTheme = () => {
  isDark.value = !isDark.value
  colorMode.preference = isDark.value ? 'dark' : 'light'
}
</script>