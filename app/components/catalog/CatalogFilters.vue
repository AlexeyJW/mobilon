<template>
  <section class="px-4">

    <UCard>

      <div class="grid md:grid-cols-3 gap-4">

        <UInput
          icon="i-lucide-search"
          placeholder="Пошук товару..."
        />

        <USelect
          placeholder="Категорія"
          :items="[]"
        />

        <USelect
          placeholder="Бренд"
          :items="[]"
        />

      </div>

    </UCard>

  </section>
</template>