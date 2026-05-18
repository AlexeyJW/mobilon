<template>
   <button
    class="fixed top-4 right-4 z-50 text-2xl"
    @click="toggleTheme"
  >
    <span v-if="colorMode.value === 'dark'">
      ☀️
    </span>

    <span v-else>
      🌙
    </span>
  </button>
</template>

<script setup lang="ts">
 const colorMode = useColorMode()
 function toggleTheme() {
    colorMode.preference =
        colorMode.value === 'dark'
         ? 'light'
         : 'dark'   
}
</script>

<style scoped>

</style>