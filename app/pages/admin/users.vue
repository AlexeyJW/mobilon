<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

interface AdminUser {
  id: number
  name: string
  username: string
  role: 'ADMIN' | 'MANAGER'
  active: boolean
  createdAt: string
  updatedAt: string
}

const users = ref<AdminUser[]>([])
const loading = ref(false)
const showModal = ref(false)
const saving = ref(false)

const form = reactive({
  name: '',
  username: '',
  password: '',
  role: 'MANAGER' as 'ADMIN' | 'MANAGER'
})

async function loadUsers() {
  loading.value = true

  try {
    const result = await $fetch<{
      success: boolean
      users: AdminUser[]
    }>('/api/admin/users')

    users.value = result.users
  } catch (error) {
    console.error('Failed to load users:', error)
  } finally {
    loading.value = false
  }
}

function openCreateModal() {
  form.name = ''
  form.username = ''
  form.password = ''
  form.role = 'MANAGER'

  showModal.value = true
}

async function createUser() {
  if (!form.name || !form.username || !form.password) {
    alert('Заповніть усі поля')
    return
  }

  saving.value = true

  try {
    await $fetch('/api/admin/users', {
      method: 'POST',
      body: {
        name: form.name,
        username: form.username,
        password: form.password,
        role: form.role
      }
    })

    showModal.value = false

    await loadUsers()
  } catch (error: any) {
    console.error('Failed to create user:', error)

    alert(
      error?.data?.statusMessage ||
      'Не вдалося створити співробітника'
    )
  } finally {
    saving.value = false
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('uk-UA')
}

onMounted(loadUsers)


const showChangePasswordModal = ref(false)
const changingUserPassword = ref<AdminUser | null>(null)
const newUserPassword = ref('')
const changingUserPasswordLoading = ref(false)

function openChangePasswordModal(user: AdminUser) {
  changingUserPassword.value = user
  newUserPassword.value = ''
  showChangePasswordModal.value = true
}

async function changeUserPassword() {
  if (!changingUserPassword.value) return

  if (newUserPassword.value.length < 6) {
    alert('Пароль має містити щонайменше 6 символів')
    return
  }

  changingUserPasswordLoading.value = true

  try {
    await $fetch(
      `/api/admin/users/${changingUserPassword.value.id}/password`,
      {
        method: 'POST',
        body: {
          password: newUserPassword.value
        }
      }
    )

    showChangePasswordModal.value = false

    alert(
      `Пароль користувача "${changingUserPassword.value.name}" змінено`
    )
  } catch (error: any) {
    console.error(error)

    alert(
      error?.data?.statusMessage ||
      'Не вдалося змінити пароль'
    )
  } finally {
    changingUserPasswordLoading.value = false
  }
}

const changingUserStatus = ref<number | null>(null)

async function toggleUserStatus(user: AdminUser) {
  changingUserStatus.value = user.id

  try {
    if (user.active) {
      await $fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE'
      })
    } else {
      await $fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        body: {
          name: user.name,
          username: user.username,
          role: user.role,
          active: true
        }
      })
    }

    await loadUsers()
  } catch (error: any) {
    console.error(error)

    alert(
      error?.data?.statusMessage ||
      'Не вдалося змінити статус користувача'
    )
  } finally {
    changingUserStatus.value = null
  }
}
</script>

<template>
  <div class="space-y-6">

    <!-- Заголовок -->
    <div class="flex items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-default">
          Співробітники
        </h1>

        <p class="text-sm text-muted mt-1">
          Керування доступом до адмінки
        </p>
      </div>

      <UButton
        icon="i-lucide-user-plus"
        color="primary"
        @click="openCreateModal"
      >
        Додати співробітника
      </UButton>
    </div>

    <!-- Таблиця -->
    <UCard>
      <div
        v-if="loading"
        class="py-10 text-center text-muted"
      >
        Завантаження...
      </div>

      <div
        v-else-if="users.length === 0"
        class="py-10 text-center text-muted"
      >
        Співробітників поки немає
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border">
              <th class="text-left py-3 px-3">
                Ім'я
              </th>

              <th class="text-left py-3 px-3">
                Логін
              </th>

              <th class="text-left py-3 px-3">
                Роль
              </th>

              <th class="text-left py-3 px-3">
                Статус
              </th>

              <th class="text-left py-3 px-3">
                Створено
              </th>
              <th class="text-right py-3 px-3">
                Дії
              </th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="user in users"
              :key="user.id"
              class="border-b border-border last:border-0"
            >
              <td class="py-3 px-3 font-medium">
                {{ user.name }}
              </td>

              <td class="py-3 px-3 text-muted">
                {{ user.username }}
              </td>

              <td class="py-3 px-3">
                <UBadge
                  :color="user.role === 'ADMIN' ? 'primary' : 'neutral'"
                  variant="subtle"
                >
                  {{
                    user.role === 'ADMIN'
                      ? 'Адміністратор'
                      : 'Менеджер'
                  }}
                </UBadge>
              </td>

              <td class="py-3 px-3">
                <UBadge
                  :color="user.active ? 'success' : 'error'"
                  variant="subtle"
                >
                  {{ user.active ? 'Активний' : 'Неактивний' }}
                </UBadge>
              </td>

              <td class="py-3 px-3 text-muted">
                {{ formatDate(user.createdAt) }}
              </td>
<td class="py-3 px-3 text-right">
  <div class="flex items-center justify-end gap-1">

    <!-- Змінити пароль -->
    <UButton
      icon="i-lucide-key-round"
      color="neutral"
      variant="ghost"
      size="sm"
      title="Змінити пароль"
      @click="openChangePasswordModal(user)"
    />

    <!-- Деактивувати / активувати -->
    <UButton
      v-if="user.active"
      icon="i-lucide-user-x"
      color="error"
      variant="ghost"
      size="sm"
      title="Деактивувати"
      :loading="changingUserStatus === user.id"
      @click="toggleUserStatus(user)"
    />

    <UButton
      v-else
      icon="i-lucide-user-check"
      color="success"
      variant="ghost"
      size="sm"
      title="Активувати"
      :loading="changingUserStatus === user.id"
      @click="toggleUserStatus(user)"
    />

  </div>
</td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>

    <!-- Створення співробітника -->
    <UModal v-model:open="showModal">
      <template #content>
        <UCard class="w-full max-w-md">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-xl font-bold">
                Новий співробітник
              </h2>

              <p class="text-sm text-muted mt-1">
                Створіть доступ до адмінки
              </p>
            </div>

            <UButton
              icon="i-lucide-x"
              color="neutral"
              variant="ghost"
              @click="showModal = false"
            />
          </div>

          <div class="space-y-4">

            <UFormField label="Ім'я">
              <UInput
                v-model="form.name"
                placeholder="Іван Петренко"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Логін">
              <UInput
                v-model="form.username"
                placeholder="ivan"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Пароль">
              <UInput
                v-model="form.password"
                type="password"
                placeholder="Мінімум 6 символів"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Роль">
              <USelect
                v-model="form.role"
                :items="[
                  {
                    label: 'Менеджер',
                    value: 'MANAGER'
                  },
                  {
                    label: 'Адміністратор',
                    value: 'ADMIN'
                  }
                ]"
                class="w-full"
              />
            </UFormField>

            <div class="flex justify-end gap-2 pt-4">
              <UButton
                color="neutral"
                variant="ghost"
                @click="showModal = false"
              >
                Скасувати
              </UButton>

              <UButton
                color="primary"
                :loading="saving"
                @click="createUser"
              >
                Створити
              </UButton>
            </div>

          </div>
        </UCard>
      </template>
    </UModal>

  </div>
  <UModal v-model:open="showChangePasswordModal">
  <template #content>
    <UCard class="w-full max-w-md">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-xl font-bold">
            Змінити пароль
          </h2>

          <p class="text-sm text-muted mt-1">
            {{ changingUserPassword?.name }}
          </p>
        </div>

        <UButton
          icon="i-lucide-x"
          color="neutral"
          variant="ghost"
          @click="showChangePasswordModal = false"
        />
      </div>

      <div class="space-y-4">
        <UFormField label="Новий пароль">
          <UInput
            v-model="newUserPassword"
            type="password"
            placeholder="Мінімум 6 символів"
            class="w-full"
          />
        </UFormField>

        <div class="flex justify-end gap-2 pt-4">
          <UButton
            color="neutral"
            variant="ghost"
            @click="showChangePasswordModal = false"
          >
            Скасувати
          </UButton>

          <UButton
            color="primary"
            :loading="changingUserPasswordLoading"
            @click="changeUserPassword"
          >
            Змінити пароль
          </UButton>
        </div>
      </div>
    </UCard>
  </template>
</UModal>
</template>