<script setup>
const route = useRoute()

const showCTA = useState('showCTA', () => true)

let observer = null

async function scrollToForm() {

  // одразу ховаємо CTA
  showCTA.value = false

  // якщо вже на головній
  if (route.path === '/') {

    const element = document.getElementById('contact-form')

    if (element) {
      element.scrollIntoView({
        behavior: 'smooth'
      })
    }

    return
  }

  // якщо на іншій сторінці
  await navigateTo('/#contact-form')
}

function setupObserver() {

  // cleanup
  if (observer) {
    observer.disconnect()
  }

  const form = document.getElementById('contact-form')

  // якщо форми нема → показуємо CTA
  if (!form) {
    showCTA.value = true
    return
  }

  observer = new IntersectionObserver(
    ([entry]) => {

      // якщо форма видима
      showCTA.value = !entry.isIntersecting

    },
    {
      threshold: 0.3
    }
  )

  observer.observe(form)
}

onMounted(() => {

  // маленька затримка після hydration
  setTimeout(() => {
    setupObserver()
  }, 200)

})

watch(
  () => route.fullPath,
  () => {

    // після route transition
    setTimeout(() => {
      setupObserver()
    }, 300)

  }
)

onUnmounted(() => {

  if (observer) {
    observer.disconnect()
  }

})
</script>

<template>

  <Transition
    enter-active-class="transition duration-300"
    enter-from-class="opacity-0 translate-y-5"
    enter-to-class="opacity-100 translate-y-0"

    leave-active-class="transition duration-300"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-5"
  >

    <div
      v-if="showCTA"
      class="
        fixed
        bottom-3
        left-3
        right-3

        z-50

        md:hidden
      "
    >

      <div
        class="
          rounded-2xl

          border
          border-white/10

          bg-black/30
          backdrop-blur-md

          p-2

          shadow-xl
        "
      >

        <UButton
          block
          size="lg"
          @click="scrollToForm"
          class="rounded-xl"
        >
          Подати заявку
        </UButton>

      </div>

    </div>

  </Transition>

</template>