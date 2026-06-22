<!-- components/ThemeToggle.vue -->
<template>
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
</template>

<script setup>
const colorMode = useColorMode()

const isDark = computed(() => colorMode.value === 'dark')

const toggleTheme = () => {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}
</script>

<style scoped>
.theme-toggle-btn {
  transition: all 0.3s ease;
}

.theme-toggle-btn:active {
  transform: scale(0.95);
}
</style>