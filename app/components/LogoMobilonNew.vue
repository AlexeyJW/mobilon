```vue
<template>
  <div class="inline-flex flex-col items-start bg-black px-3 py-1 rounded-lg      mt-2" >
    <!-- Назва -->
    <div
      class="flex items-center font-['Arial_Black'] text-4xl leading-none tracking-tight"
      aria-label="Mobilon"
    >
      <!-- Mobil -->
      <span class="text-white">
        mobil
      </span>

      <!-- o — символ живлення -->
      <span
        class="relative mx-[1px] inline-flex h-[0.9em] w-[0.9em] items-center justify-center text-sky-400"
      >
        <!-- Коло -->
        <span
          class="absolute inset-[0.08em] rounded-full border-[0.11em] border-sky-400"
          style="border-top-color: transparent;"
        />

        <!-- Вертикальна рисочка -->
        <span
          class="absolute top-0 left-1/2 h-[0.42em] w-[0.11em] -translate-x-1/2 rounded-full bg-sky-400"
        />
      </span>

      <!-- n -->
      <span class="text-sky-400">
        n
      </span>
    </div>

    <!-- Слоган -->
    <div
      class="mt-1 font-sans text-[9px] font-light tracking-[0.08em] text-white/90 sm:text-[10px] self-center"
    >
      сучасні мобільні технології
    </div>
  </div>
</template>
```
