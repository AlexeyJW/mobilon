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

      <h1 class="font-bold text-xl">
        Admin Panel
      </h1>
      <UButton
        to="/admin/customers"
        variant="ghost"
      >
        Клієнти
      </UButton>
      <UButton
        to="/admin/requests"
        variant="ghost"
      >
        Заявки
      </UButton>
      <UButton
        to="/"
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