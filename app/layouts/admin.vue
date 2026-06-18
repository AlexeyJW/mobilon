<script setup>
const route = useRoute()
</script>
<template>

  <div
    class="
      min-h-screen

      bg-gray-50
      dark:bg-gray-950
    "
  >

    <div
      class="
        border-b
        border-default

        px-6
        py-4

        flex
        items-center
        justify-between
      "
    >

     
    <UButton
  to="/admin"
  icon="i-lucide-layout-dashboard"
  :variant="
    route.path === '/admin'
      ? 'solid'
      : 'ghost'
  "
>
  Dashboard
</UButton>
      <UButton
  to="/admin/customers"
  icon="i-lucide-users"
  :variant="
    route.path.startsWith('/admin/customers')
      ? 'solid'
      : 'ghost'
  "
>
  Клієнти
</UButton>
     <UButton
  to="/admin/requests"
  icon="i-lucide-clipboard-list"
  :variant="
    route.path.startsWith('/admin/requests')
      ? 'solid'
      : 'ghost'
  "
>
  Заявки
</UButton>
    <UButton
  to="/"
  icon="i-lucide-house"
  variant="ghost"
>
  На сайт
</UButton>

    </div>

    <main class="p-6">
      <slot />
    </main>

  </div>

</template>