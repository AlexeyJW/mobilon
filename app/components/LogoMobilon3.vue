
<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: 'sm' | 'md' | 'lg'
  }>(),
  {
    size: 'md',
  }
)
</script>

<template>
  <div
    class="inline-flex flex-col items-start select-none"
    :class="{
      'scale-90 origin-left': size === 'sm',
      'scale-100 origin-left': size === 'md',
      'scale-110 origin-left': size === 'lg',
    }"
  >
    <!-- LOGO -->
    <div
      class="flex items-center whitespace-nowrap font-['Carlito',Arial,sans-serif] font-bold leading-none tracking-[-0.045em]"
      :class="{
        'text-[28px] sm:text-[30px]': size === 'sm',
        'text-[34px] sm:text-[38px] lg:text-[42px]': size === 'md',
        'text-[40px] sm:text-[44px] lg:text-[50px]': size === 'lg',
      }"
      aria-label="Mobilon"
    >
      <!-- Mobil -->
      <span class="text-gray-950 dark:text-white">
        mobil
      </span>

      <!-- O — POWER SYMBOL -->
      <span
        class="relative mx-[1px] inline-block shrink-0 align-middle"
        :class="{
          'h-[0.82em] w-[0.82em]': true,
        }"
        aria-hidden="true"
      >
        <!-- Power circle -->
        <span
          class="absolute inset-[0.075em] rounded-full border-[0.095em] border-sky-400"
          style="border-top-color: transparent;"
        />

        <!-- Power vertical line -->
        <span
          class="absolute left-1/2 top-[-0.015em] h-[0.42em] w-[0.095em] -translate-x-1/2 rounded-full bg-sky-400"
        />
      </span>

      <!-- N -->
      <span class="text-sky-400">
        n
      </span>
    </div>

    <!-- SLOGAN -->
    <div
      class="mt-[4px] whitespace-nowrap font-sans font-light leading-none tracking-[0.055em] text-gray-700 dark:text-white/90 self-center"
      :class="{
        'text-[7px] sm:text-[8px]': size === 'sm',
        'text-[8px] sm:text-[9px] lg:text-[10px]': size === 'md',
        'text-[9px] sm:text-[10px] lg:text-[11px]': size === 'lg',
      }"
    >
      сучасні мобільні технології
    </div>
  </div>
</template>
