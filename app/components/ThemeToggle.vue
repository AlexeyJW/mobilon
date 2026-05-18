<script setup>
const colorMode = useColorMode()

function toggleTheme() {
  colorMode.preference =
    colorMode.value === 'dark'
      ? 'light'
      : 'dark'
}
</script>

<template>

  <button
    @click="toggleTheme"
    class="
      fixed
      top-4
      right-4
      z-50

      w-10
      h-10

      rounded-full

      backdrop-blur
      bg-white/10
      border
      border-white/20

      flex
      items-center
      justify-center

      text-xl

      transition-all
      duration-300

      hover:scale-110
    "
  >

    <span v-if="colorMode.value === 'dark'">
      ☀️
    </span>

    <span v-else>
      🌙
    </span>

  </button>

</template>