<script setup lang="ts">
const mobi = useMobi()

const container = ref<HTMLElement>()

watch(
  () => mobi.messages.value.length,
  async () => {
    await nextTick()

    if (container.value) {
      container.value.scrollTop =
        container.value.scrollHeight
    }
  }
)
</script>

<template>
  <div
    ref="container"
    class="
      h-[420px]
      overflow-y-auto
      p-5
      bg-white
    "
  >
    <TransitionGroup
      name="fade"
      tag="div"
    >
      <MobiMessage
        v-for="message in mobi.messages.value"
        :key="message.id"
        :message="message"
      />
    </TransitionGroup>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all .25s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.fade-leave-to {
  opacity: 0;
}
</style>