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

            <UDivider orientation="vertical" class="h-6" />

            <UButton
              to="/"
              icon="i-lucide-house"
              color="primary"
              variant="ghost"
              size="sm"
            >
              <span class="hidden lg:inline">На сайт</span>
            </UButton>
          </nav>

          <div class="flex items-center gap-2">
            <ThemeToggleAdmin />

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

      <!-- Мобільне меню (без лінії) -->
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

          <UDivider />

          <UButton
            to="/"
            icon="i-lucide-house"
            color="primary"
            variant="ghost"
            block
            class="justify-start"
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
      </div>
    </nav>

    <div class="h-16 md:hidden" />
  </div>
</template>