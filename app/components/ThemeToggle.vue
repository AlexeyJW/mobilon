<script setup>
const colorMode = useColorMode()

const mounted = ref(false)

onMounted(() => {
  mounted.value = true
})

function toggleTheme() {
  colorMode.preference =
    colorMode.value === 'dark'
      ? 'light'
      : 'dark'
}
</script>

<template>

  <button
    v-if="mounted"
    @click="toggleTheme"
    class="
      fixed
      top-4
      right-4
      z-50

      w-11
      h-11

      rounded-xl

      bg-white/10
      backdrop-blur

      border
      border-white/10

      flex
      items-center
      justify-center

      shadow-lg

      transition-all
      duration-300

      hover:scale-105
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