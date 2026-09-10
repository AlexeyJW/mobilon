<template>
  <UApp>
  <div>
   <NuxtLayout >
    
      <NuxtPage />
   </NuxtLayout>

  
    
  </div>
</UApp>
</template>
<script setup lang="ts">
const route = useRoute()

useHead(() => ({
  link: [
    {
      rel: 'canonical',
      href: `https://mobilon.com.ua${route.path === '/' ? '/' : route.path}`
    }
  ]
}))

</script>
