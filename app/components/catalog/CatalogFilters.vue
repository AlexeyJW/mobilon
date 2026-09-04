<script setup lang="ts">
interface CatalogFilterOption {
  label: string
  value: string | number | boolean
}

interface CatalogFilter {
  id: number
  key: string
  name: string
  type: 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'SELECT' | 'MULTISELECT'
  unit: string | null
  options: CatalogFilterOption[]
}

const props = defineProps<{
  filters: CatalogFilter[]
  selected: Record<
    string,
    Array<string | number | boolean>
  >
}>()

const emit = defineEmits<{
  toggle: [
    key: string,
    value: string | number | boolean
  ]
  clear: []
}>()

function isSelected(
  key: string,
  value: string | number | boolean
) {
  return props.selected[key]?.includes(value) ?? false
}

const activeCount = computed(() => {
  return Object.values(props.selected)
    .reduce(
      (total, values) =>
        total + values.length,
      0
    )
})
</script>

<template>
  <div class="space-y-4">

    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <UIcon
          name="i-lucide-sliders-horizontal"
          class="size-5"
        />

        <h2 class="font-semibold">
          Фільтри
        </h2>

        <UBadge
          v-if="activeCount"
          color="primary"
          variant="soft"
        >
          {{ activeCount }}
        </UBadge>
      </div>

      <UButton
        v-if="activeCount"
        type="button"
        variant="ghost"
        color="neutral"
        size="xs"
        @click="emit('clear')"
      >
        Скинути
      </UButton>
    </div>

    <USeparator />

    <UAccordion
      :items="
        filters.map(filter => ({
          label: filter.name,
          value: filter.key,
          filter
        }))
      "
      multiple
    >
      <template #body="{ item }">
        <div class="flex flex-wrap gap-2 pt-2">
          <UButton
            v-for="option in item.filter.options"
            :key="`${item.filter.key}-${String(option.value)}`"
            type="button"
            size="xs"
            :variant="
              isSelected(
                item.filter.key,
                option.value
              )
                ? 'solid'
                : 'soft'
            "
            :color="
              isSelected(
                item.filter.key,
                option.value
              )
                ? 'primary'
                : 'neutral'
            "
            @click="
              emit(
                'toggle',
                item.filter.key,
                option.value
              )
            "
          >
            {{ option.label }}
          </UButton>
        </div>
      </template>
    </UAccordion>

  </div>
</template>