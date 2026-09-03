<!-- layouts/admin.vue -->
<script setup>
const route = useRoute()
const isMobileMenuOpen = ref(false)
const isActive = (path: string) => {
  return route.path === path
}
const { data: auth } = await useFetch('/api/auth')

const currentUser = computed(() => auth.value?.user)

watch(() => route.path, () => {
  isMobileMenuOpen.value = false
})

async function logout() {
  try {
    await $fetch('/api/auth-logout', {
      method: 'POST'
    })

    await navigateTo('/admin/login')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}
const showPasswordModal = ref(false)
const changingPassword = ref(false)

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

function openPasswordModal() {
  passwordForm.currentPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''

  showPasswordModal.value = true
}

async function changePassword() {
  if (
    !passwordForm.currentPassword ||
    !passwordForm.newPassword ||
    !passwordForm.confirmPassword
  ) {
    alert('Заповніть усі поля')
    return
  }

  if (passwordForm.newPassword.length < 6) {
    alert('Новий пароль має містити щонайменше 6 символів')
    return
  }

  if (
    passwordForm.newPassword !==
    passwordForm.confirmPassword
  ) {
    alert('Нові паролі не співпадають')
    return
  }

  changingPassword.value = true

  try {
    await $fetch('/api/change-password', {
      method: 'POST',
      body: {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      }
    })

    showPasswordModal.value = false

    alert('Пароль успішно змінено')
  } catch (error) {
    alert(
      error?.data?.statusMessage ||
      'Не вдалося змінити пароль'
    )
  } finally {
    changingPassword.value = false
  }
}
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
                to="/admin/users"
                icon="i-lucide-users-round"
                color="primary"
                :variant="route.path.startsWith('/admin/users') ? 'solid' : 'ghost'"
                size="sm"
              >
                Співробітники
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
            <UButton
              to="/admin/services"
              icon="i-lucide-wrench"
              color="primary"
              :variant="route.path.startsWith('/admin/services') ? 'solid' : 'ghost'"
              size="sm"
            >
              Послуги
            </UButton>
             <UButton
              to="/admin/qr"
              icon="i-lucide-qr-code"
              color="primary"
              :variant="route.path.startsWith('/admin/qr') ? 'solid' : 'ghost'"
              size="sm"
            >
              QR Code
            </UButton>
            <UButton
              to="/admin/content"
              icon="i-lucide-panels-top-left"
              color="primary"
              :variant="route.path.startsWith('/admin/content') ? 'solid' : 'ghost'"
              size="sm"
            >
              Контент
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
           <div
  v-if="currentUser"
  class="hidden sm:flex items-center gap-2 mr-2"
>
  <UButton
    color="neutral"
    variant="ghost"
    class="flex items-center gap-2"
    @click="openPasswordModal"
  >
    <div class="text-right leading-tight">
      <div class="text-sm font-medium text-default">
        {{ currentUser.name }}
      </div>

      <div class="text-xs text-muted">
        {{
          currentUser.role === 'ADMIN'
            ? 'Адміністратор'
            : 'Менеджер'
        }}
      </div>
    </div>

    <div
      class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"
    >
      <Icon
        name="i-lucide-user"
        class="w-4 h-4 text-primary"
      />
    </div>
  </UButton>
</div>
            <UButton
              icon="i-lucide-log-out"
              color="primary"
              variant="ghost"
              size="sm"
              @click="logout"
            >
              <span class="hidden lg:inline">Вийти</span>
            </UButton>

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
    <Transition
    enter-active-class="transition-all duration-350 ease-[cubic-bezier(0.22,1,0.36,1)]"
    enter-from-class="opacity-0 -translate-y-4 max-h-0"
    enter-to-class="opacity-100 translate-y-0 max-h-[600px]"
    leave-active-class="transition-all duration-250 ease-in"
    leave-from-class="opacity-100 translate-y-0 max-h-[600px]"
    leave-to-class="opacity-0 -translate-y-4 max-h-0"
  />
      <div 
        v-if="isMobileMenuOpen" 
        class="absolute left-0 right-0 top-full md:hidden bg-default overflow-hidden shadow-lg"
      >
        <div class="container mx-auto px-4 py-4 space-y-1">
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
  to="/admin/content"
  icon="i-lucide-panels-top-left"
  color="primary"
  :variant="route.path.startsWith('/admin/content') ? 'solid' : 'ghost'"
  block
  class="justify-start"
>
  Редагування контенту
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
  to="/admin/users"
  icon="i-lucide-users-round"
  color="primary"
  :variant="route.path.startsWith('/admin/users') ? 'solid' : 'ghost'"
  block
  class="justify-start"
>
  Співробітники
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
<UButton
  to="/admin/services"
  icon="i-lucide-wrench"
  color="primary"
  :variant="route.path.startsWith('/admin/services') ? 'solid' : 'ghost'"
  block
  class="justify-start"
>
  Послуги
</UButton>
 <UButton
              to="/admin/qr"
              icon="i-lucide-qr-code"
              color="primary"
              :variant="route.path.startsWith('/admin/qr') ? 'solid' : 'ghost'"
              size="sm"
            >
              QR Code
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
          <UButton
            icon="i-lucide-log-out"
            color="primary"
            variant="ghost"
            block
            class="justify-start"
            @click="logout"
          >
            Вийти
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
    <UModal v-model:open="showPasswordModal">
  <template #content>
    <UCard class="w-full max-w-md">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-xl font-bold">
            Змінити пароль
          </h2>

          <p class="text-sm text-muted mt-1">
            {{ currentUser?.name }}
          </p>
        </div>

        <UButton
          icon="i-lucide-x"
          color="neutral"
          variant="ghost"
          @click="showPasswordModal = false"
        />
      </div>

      <div class="space-y-4">
        <UFormField label="Поточний пароль">
          <UInput
            v-model="passwordForm.currentPassword"
            type="password"
            placeholder="Введіть поточний пароль"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Новий пароль">
          <UInput
            v-model="passwordForm.newPassword"
            type="password"
            placeholder="Мінімум 6 символів"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Підтвердження нового пароля">
          <UInput
            v-model="passwordForm.confirmPassword"
            type="password"
            placeholder="Повторіть новий пароль"
            class="w-full"
          />
        </UFormField>

        <div class="flex justify-end gap-2 pt-4">
          <UButton
            color="neutral"
            variant="ghost"
            @click="showPasswordModal = false"
          >
            Скасувати
          </UButton>

          <UButton
            color="primary"
            :loading="changingPassword"
            @click="changePassword"
          >
            Змінити пароль
          </UButton>
        </div>
      </div>
    </UCard>
  </template>
</UModal>


  </div>
</template> 