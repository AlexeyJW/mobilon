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
  // очищення попереднього спостерігача
  if (observer) {
    observer.disconnect()
  }

  // отримуємо обидві форми
  const contactForm = document.getElementById('contact-form')
  const aboutCta = document.getElementById('about-cta')
  
  // створюємо масив тільки з існуючих форм
  const forms = [contactForm, aboutCta].filter(form => form !== null)

  // якщо жодної форми немає → показуємо CTA
  if (forms.length === 0) {
    showCTA.value = true
    return
  }

  // спостерігаємо за обома формами одночасно
  observer = new IntersectionObserver(
    (entries) => {
      // перевіряємо, чи хоч одна форма видима
      const isAnyFormVisible = entries.some(entry => entry.isIntersecting)
      
      // CTA ховається, якщо будь-яка форма видима
      showCTA.value = !isAnyFormVisible
    },
    {
      threshold: 0.3
    }
  )

  // додаємо всі форми до спостерігача
  forms.forEach(form => observer.observe(form))
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