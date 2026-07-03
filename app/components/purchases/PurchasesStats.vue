<template>
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
    <UCard class="bg-elevated">
      <div class="text-center">
        <p class="text-xs sm:text-sm text-muted">
          Всього товарів
        </p>

        <p class="text-xl sm:text-2xl font-bold text-default">
          {{ totalItems }}
        </p>
      </div>
    </UCard>

    <UCard class="bg-elevated">
      <div class="text-center">
        <p class="text-xs sm:text-sm text-muted">
          Всього одиниць
        </p>

        <p class="text-xl sm:text-2xl font-bold text-default">
          {{ totalQuantity }}
        </p>
      </div>
    </UCard>

    <UCard class="bg-elevated">
      <div class="text-center">
        <p class="text-xs sm:text-sm text-muted">
          Постачальників
        </p>

        <p class="text-xl sm:text-2xl font-bold text-default">
          {{ uniqueSuppliers }}
        </p>
      </div>
    </UCard>

    <UCard class="bg-elevated">
      <div class="text-center">
        <p class="text-xs sm:text-sm text-muted">
          Останнє оновлення
        </p>

        <p class="text-lg font-bold text-default">
          {{ lastUpdate }}
        </p>
      </div>
    </UCard>
  </div>
</template>

<script setup>
defineProps({
  totalItems: Number,
  totalQuantity: Number,
  uniqueSuppliers: Number,
  lastUpdate: String
})
</script>