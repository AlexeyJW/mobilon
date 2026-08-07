<!-- layouts/admin.vue -->
<script setup>
const route = useRoute()
const isMobileMenuOpen = ref(false)

watch(() => route.path, () => {
  isMobileMenuOpen.value = false
})
</script>

<template>
  <div class="min-h-screen bg-default">
    
    <!-- Хедер без нижньої лінії -->
    <header class="sticky top-0 z-50 bg-default/80 backdrop-blur-lg">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          
          <NuxtLink to="/admin" class="flex items-center gap-2 shrink-0">
            <div class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span class="text-primary-inverted font-bold text-sm">A</span>
            </div>
            <span class="text-default font-bold hidden sm:block">Admin</span>
          </NuxtLink>

          <!-- Десктопна навігація -->
          <nav class="hidden md:flex items-center gap-2">
            <UButton
              to="/admin"
              icon="i-lucide-layout-dashboard"
              color="primary"
              :variant="route.path === '/admin' ? 'solid' : 'ghost'"
              size="sm"
            >
              Dashboard
            </UButton>
            
            <UButton
              to="/admin/customers"
              icon="i-lucide-users"
              color="primary"
              :variant="route.path.startsWith('/admin/customers') ? 'solid' : 'ghost'"
              size="sm"
            >
              Клієнти
            </UButton>
            
            <UButton
              to="/admin/requests"
              icon="i-lucide-clipboard-list"
              color="primary"
              :variant="route.path.startsWith('/admin/requests') ? 'solid' : 'ghost'"
              size="sm"
            >
              Заявки
            </UButton>

            <!-- Нова кнопка "Закупівлі" -->
            <UButton
              to="/admin/purchases"
              icon="i-lucide-shopping-cart"
              color="primary"
              :variant="route.path.startsWith('/admin/purchases') ? 'solid' : 'ghost'"
              size="sm"
            >
              Закупівлі
            </UButton>
            <UButton
  to="/admin/products"
  icon="i-lucide-smartphone"
  color="primary"
  :variant="route.path.startsWith('/admin/products') ? 'solid' : 'ghost'"
  block
  class="justify-start"
>
  Товари
</UButton>

            <USeparator orientation="vertical" class="h-6" />

            <UButton
              to="/"
              icon="i-lucide-house"
              color="primary"
              variant="ghost"
              size="sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span class="hidden lg:inline">На сайт</span>
            </UButton>
          </nav>

          <div class="flex items-center gap-2">
            <!-- Кнопка на сайт для мобільних -->
            <UButton
              to="/"
              icon="i-lucide-house"
              color="primary"
              variant="ghost"
              size="sm"
              class="md:hidden"
              target="_blank"
              rel="noopener noreferrer"
            />

            <ThemeToggle/>

            <UButton
              color="primary"
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
        <div class="container mx-auto px-4 py-4 space-y-2">
          <UButton
            to="/admin"
            icon="i-lucide-layout-dashboard"
            color="primary"
            :variant="route.path === '/admin' ? 'solid' : 'ghost'"
            block
            class="justify-start"
          >
            Dashboard
          </UButton>
          
          <UButton
            to="/admin/customers"
            icon="i-lucide-users"
            color="primary"
            :variant="route.path.startsWith('/admin/customers') ? 'solid' : 'ghost'"
            block
            class="justify-start"
          >
            Клієнти
          </UButton>
          
          <UButton
            to="/admin/requests"
            icon="i-lucide-clipboard-list"
            color="primary"
            :variant="route.path.startsWith('/admin/requests') ? 'solid' : 'ghost'"
            block
            class="justify-start"
          >
            Заявки
          </UButton>

          <!-- Нова кнопка "Закупівлі" в мобільному меню -->
          <UButton
            to="/admin/purchases"
            icon="i-lucide-shopping-cart"
            color="primary"
            :variant="route.path.startsWith('/admin/purchases') ? 'solid' : 'ghost'"
            block
            class="justify-start"
          >
            Закупівлі
          </UButton>

          <USeparator orientation="vertical" class="h-6" />

          <UButton
            to="/"
            icon="i-lucide-house"
            color="primary"
            variant="solid"
            block
            class="justify-start"
           
            rel="noopener noreferrer"
          >
            На сайт
          </UButton>
        </div>
      </div>
    </header>

    <!-- Основний контент -->
    <main class="container mx-auto px-4 py-6">
      <slot />
    </main>

    <!-- Мобільна нижня навігація -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-default/80 backdrop-blur-lg">
      <div class="flex items-center justify-around h-16">
        <UButton
          to="/admin"
          icon="i-lucide-layout-dashboard"
          color="primary"
          :variant="route.path === '/admin' ? 'solid' : 'ghost'"
          class="flex-col h-auto py-1 px-3"
          size="sm"
        >
          <span class="text-[10px] mt-1">Головна</span>
        </UButton>
        
        <UButton
          to="/admin/customers"
          icon="i-lucide-users"
          color="primary"
          :variant="route.path.startsWith('/admin/customers') ? 'solid' : 'ghost'"
          class="flex-col h-auto py-1 px-3"
          size="sm"
        >
          <span class="text-[10px] mt-1">Клієнти</span>
        </UButton>
        
        <UButton
          to="/admin/requests"
          icon="i-lucide-clipboard-list"
          color="primary"
          :variant="route.path.startsWith('/admin/requests') ? 'solid' : 'ghost'"
          class="flex-col h-auto py-1 px-3"
          size="sm"
        >
          <span class="text-[10px] mt-1">Заявки</span>
        </UButton>

        <!-- Нова кнопка "Закупівлі" в нижній навігації -->
        <UButton
          to="/admin/purchases"
          icon="i-lucide-shopping-cart"
          color="primary"
          :variant="route.path.startsWith('/admin/purchases') ? 'solid' : 'ghost'"
          class="flex-col h-auto py-1 px-3"
          size="sm"
        >
          <span class="text-[10px] mt-1">Закупівлі</span>
        </UButton>

        <UButton
          to="/admin/products"
          icon="i-lucide-smartphone"
          color="primary"
          :variant="route.path.startsWith('/admin/products') ? 'solid' : 'ghost'"
          class="flex-col h-auto py-1 px-3"
          size="sm" 
        >
          <span class="text-[10px] mt-1">Товари</span>
        </UButton>
        <UButton
          to="/"
          icon="i-lucide-house"
          color="primary"
          variant="ghost"
          class="flex-col h-auto py-1 px-3"
          size="sm"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span class="text-[10px] mt-1">Сайт</span>
        </UButton>
      </div>
    </nav>

    <div class="h-16 md:hidden" />
  </div>
</template> 