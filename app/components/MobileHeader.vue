 <template>
    <USlideover side="left" title="Mobilon">
        <UButton 
        
         icon="i-heroicons-bars-3"
          class="fixed top-4 left-4 z-50 text-2xl text-primary"
         color="neutral" variant="subtle" />

    <template #body>
      <div class="flex flex-col gap-4 mt-4">
        <NuxtLink
          to="/"
          @click="open = false"
        >
          Головна
        </NuxtLink>

        <NuxtLink
          to="/about"
          @click="open = false"
        >
          Про нас
        </NuxtLink>

        <a
          href="#contact-form"
          @click="open = false"
        >
          Контакти
        </a>

       <NuxtLink
          to="/admin/login"
          @click="open = false"
        >
          Адмін
        </NuxtLink>
      </div>
      
    </template>
  </USlideover>
 </template>
 