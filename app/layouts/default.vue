<!-- layouts/default.vue -->
<template>
  <div class="min-h-screen bg-default">
    <!-- Хедер без нижньої лінії -->
    <header class="sticky top-0 z-50 bg-default/80 backdrop-blur-lg">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-14 sm:h-16">
          
          <!-- Логотип -->
         <LogoMobilon3 size="md"/>

          <!-- Десктопна навігація -->
          <nav class="hidden md:flex items-center gap-4 lg:gap-6">
            <NuxtLink to="/" class="text-muted hover:text-default transition-colors text-sm font-medium">
              Головна
            </NuxtLink>
            <NuxtLink to="/services" class="text-muted hover:text-default transition-colors text-sm font-medium">
              Послуги
            </NuxtLink>
            <NuxtLink to="/price" class="text-muted hover:text-default transition-colors text-sm font-medium">
              Прайс
            </NuxtLink>
            <NuxtLink to="/about" class="text-muted hover:text-default transition-colors text-sm font-medium">
              Про нас
            </NuxtLink>
            <NuxtLink to="/contacts" class="text-muted hover:text-default transition-colors text-sm font-medium">
              Контакти
            </NuxtLink>
          </nav>

          <!-- Права частина -->
          <div class="flex items-center gap-2">
            <!-- Кнопка адмінки -->
            <UButton
              to="/admin"
              icon="i-lucide-shield"
              color="primary"
              variant="ghost"
              size="sm"
              class="hidden sm:flex"
            >
              <span class="hidden lg:inline">Адмінка</span>
            </UButton>

            <UButton
              to="/#contact-form"
              color="primary"
              size="sm"
              class="hidden md:flex"
            >
              Замовити
            </UButton>

            <ThemeToggle />
            
            <UButton
              color="neutral"
              variant="ghost"
              class="md:hidden"
              @click="isMobileMenuOpen = !isMobileMenuOpen"
            >
              <Icon 
                :name="isMobileMenuOpen ? 'i-lucide-x' : 'i-lucide-menu'" 
                class="w-5 h-5"
              />
            </UButton>
          </div>

        </div>
      </div>

      <!-- Мобільне меню -->
      <div 
        v-if="isMobileMenuOpen" 
        class="md:hidden bg-default"
      >
        <div class="container mx-auto px-4 py-4 space-y-3">
          <NuxtLink 
            to="/" 
            class="block py-2 text-default hover:text-primary transition-colors font-medium"
            @click="isMobileMenuOpen = false"
          >
            Головна
          </NuxtLink>
          <NuxtLink 
            to="/services" 
            class="block py-2 text-default hover:text-primary transition-colors font-medium"
            @click="isMobileMenuOpen = false"
          >
            Послуги
          </NuxtLink>
          <NuxtLink 
            to="/price" 
            class="block py-2 text-default hover:text-primary transition-colors font-medium"
            @click="isMobileMenuOpen = false"
          >
            Прайс
          </NuxtLink>
          <NuxtLink 
            to="/about" 
            class="block py-2 text-default hover:text-primary transition-colors font-medium"
            @click="isMobileMenuOpen = false"
          >
            Про нас
          </NuxtLink>
          <NuxtLink 
            to="/contacts" 
            class="block py-2 text-default hover:text-primary transition-colors font-medium"
            @click="isMobileMenuOpen = false"
          >
            Контакти
          </NuxtLink>
          
          <div class="w-px h-6 bg-border mx-1" />
          
          <UButton
            to="/admin"
            icon="i-lucide-shield"
            color="primary"
            variant="solid"
            block
            @click="isMobileMenuOpen = false"
          >
            Адмінка
          </UButton>

          <UButton
            to="/#contact-form"
            color="primary"
            block
            @click="isMobileMenuOpen = false"
          >
            Замовити
          </UButton>
        </div>
      </div>
    </header>

    <!-- Основний контент -->
    <main class="container mx-auto px-4 py-6 sm:py-8 lg:py-12">
      <slot />
    </main>

    <!-- Футер -->
    <footer class="border-t border-border mt-auto">
      <div class="container mx-auto px-4 py-8 sm:py-12">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          
          <!-- Колонка 1: Логотип -->
          <div class="space-y-4">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span class="text-primary-inverted font-bold text-sm">M</span>
              </div>
              <span class="text-default font-bold text-lg">Mobilon</span>
            </div>
            <p class="text-muted text-sm">
              Сервіс налаштування та оптимізації смартфонів
            </p>
          </div>

          <!-- Колонка 2: Навігація -->
          <div>
            <h3 class="text-default font-semibold mb-4">Навігація</h3>
            <ul class="space-y-2">
              <li><NuxtLink to="/" class="text-muted hover:text-default transition-colors text-sm">Головна</NuxtLink></li>
              <li><NuxtLink to="/services" class="text-muted hover:text-default transition-colors text-sm">Послуги</NuxtLink></li>
              <li><NuxtLink to="/about" class="text-muted hover:text-default transition-colors text-sm">Про нас</NuxtLink></li>
              <li><NuxtLink to="/contacts" class="text-muted hover:text-default transition-colors text-sm">Контакти</NuxtLink></li>
            </ul>
          </div>

          <!-- Колонка 3: Контакти -->
          <div>
            <h3 class="text-default font-semibold mb-4">Контакти</h3>
            <ul class="space-y-2 text-sm text-muted">
              <li class="flex items-center gap-2">
                <Icon name="i-lucide-phone" class="w-4 h-4" />
                <a href="tel:+380984455233">+38 (098) 445-52-33</a>
              </li>
              <li class="flex items-center gap-2">
                <Icon name="i-lucide-mail" class="w-4 h-4" />
                <a href="mailto:kononenko.jw@gmail.com">kononenko.jw@gmail.com</a>
              </li>
              <li class="flex items-center gap-2">
                <Icon name="i-lucide-map-pin" class="w-4 h-4" />
                <span>смт.Солотвино, вул. Дружби Народів, 3</span>
              </li>
            </ul>
          </div>

          <!-- Колонка 4: Соцмережі -->
          <div>
            <h3 class="text-default font-semibold mb-4">Слідкуйте за нами</h3>
            <div class="flex gap-3">
              <a href="#" class="w-10 h-10 rounded-lg bg-elevated hover:bg-primary/10 transition-colors flex items-center justify-center text-muted hover:text-primary">
                <Icon name="i-lucide-facebook" class="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com/mobilon_ua?igsh=Yzh2OHJ3MDE3aaXQ5" target="_blank" class="w-10 h-10 rounded-lg bg-elevated hover:bg-primary/10 transition-colors flex items-center justify-center text-muted hover:text-primary">
                <Icon name="i-lucide-instagram" class="w-5 h-5" />
              </a>
              <a href="#" class="w-10 h-10 rounded-lg bg-elevated hover:bg-primary/10 transition-colors flex items-center justify-center text-muted hover:text-primary">
                <Icon name="i-lucide-youtube" class="w-5 h-5" />
              </a>
            </div>
          </div>

        </div>

        <div class="border-t border-border mt-8 pt-6 text-center text-muted text-sm">
          © {{ new Date().getFullYear() }} ФОП Кононенко О.В. Всі права захищені.
        </div>
      </div>
    </footer>

    <!-- Мобільна CTA -->
    <div class="fixed bottom-4 left-4 right-4 md:hidden z-40">
      <UButton
        @click="navigateTo('/#contact-form')"
        color="primary"
        size="lg"
        block
        class="shadow-lg"
      >
        <Icon name="i-lucide-phone" class="w-5 h-5" />
        Залишити заявку
      </UButton>
    </div>

    <div class="h-16 md:hidden" />
    <OrderModal />
    <MobiButton />

    <MobiChat />
  </div>
</template>

<script setup>
const isMobileMenuOpen = ref(false)

watch(() => useRoute().path, () => {
  isMobileMenuOpen.value = false
})
</script>