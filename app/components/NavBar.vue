<template>
  <header class="sticky top-0 z-50 bg-white border-b">
    <div class="container mx-auto px-4 py-3 flex items-center justify-between">

      <NuxtLink to="/" class="font-bold text-xl">
        Mobilon
      </NuxtLink>

      <div class="flex items-center gap-4">

        <NuxtLink to="/about">
          Про нас
        </NuxtLink>

        <a href="#contact-form">
          Контакти
        </a>

        <NuxtLink to="/admin/login">
          <UIcon
            name="i-heroicons-lock-closed"
            class="text-2xl"
          />
        </NuxtLink>

      </div>
    </div>
  </header>
</template>