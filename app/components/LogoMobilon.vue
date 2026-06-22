<!-- components/Logo.vue -->
<template>
  <NuxtLink to="/" class="flex items-center gap-3 group">
    <!-- SVG Логотип - точна копія вашого ескізу -->
    <div class="relative flex-shrink-0">
      <svg 
        width="48" 
        height="48" 
        viewBox="0 0 48 48" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        class="group-hover:scale-105 transition-transform duration-300"
      >
        <!-- Квадратний фон із закругленими кутами (як на ескізі) -->
        <rect width="48" height="48" rx="12" fill="#22c55e" />
        
        <!-- Буква M (як на ескізі) -->
        <path 
          d="M14 36V16L18 16L24 26L30 16L34 16V36H30V23L24 33L18 23V36H14Z" 
          fill="white"
        />
      </svg>
    </div>
    
    <!-- Текст під логотипом -->
    <div class="flex flex-col">
      <span class="text-default font-bold text-xl leading-tight">
        mobilon
      </span>
      <span class="text-muted text-[10px] font-medium tracking-wider uppercase">
        сучасні мобільні технології
      </span>
    </div>
  </NuxtLink>
</template>