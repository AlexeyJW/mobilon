<!-- layouts/default.vue -->
<template>
   <MobileHeader />
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
    
    <slot />
  </div>
</template>

<style>
/* Глобальні стилі для плавності */
img, .image-container {
  mix-blend-mode: multiply; /* Для світлих тем */
}

.dark img, .dark .image-container {
  mix-blend-mode: screen; /* Для темних тем */
}
</style>