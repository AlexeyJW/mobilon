 <script setup lang="ts">
const open = ref(false)

defineShortcuts({
  o:() =>  open.value = !open.value

})
const route = useRoute()

const links = [
  { label: 'Головна', to: '/' },
  { label: 'Про нас', to: '/about' },
  { label: 'Контакти', to: '/contacts' },
  { label: 'Адмін', to: '/admin/login' }
]
</script>
 <template>
    <USlideover 
        v-model:open="open"
         :ui="{
      content: 'w-1/2'
    }"
        side="left" 
        title="Mobilon">
        <UButton 
        
         icon="i-heroicons-bars-3"
          class="fixed top-4 left-4 z-50 text-2xl text-primary"
         color="neutral" variant="subtle" />

    <template #body>
      <div class="flex flex-col gap-4 mt-4">
        <NuxtLink
      @click="open = false"
      v-for="link in links"
      :key="link.to"
      :to="link.to"
      class="px-4 py-2 rounded-lg transition"
       :class="
    route.path === link.to
      ? 'bg-black/5 dark:bg-white/10'
      : 'hover:bg-black/5 focus:bg-black/5 dark:hover:bg-white/10 dark:focus:bg-white/10'
  "
    >
      {{ link.label }}
    </NuxtLink>
      </div>
      
    </template>
  </USlideover>
 </template>
 