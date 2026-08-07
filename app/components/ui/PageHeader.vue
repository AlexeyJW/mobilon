<template>
    <div class="flex items-center justify-between mb-6">
        <div>
            <h1 class="text-3xl font-bold tracking-tight">{{ title }}</h1>
            <p
            v-if="description" 
            class="text-muted mt-1">{{ description }}</p>
        </div>
    </div>
    <slot/>
</template>

<script setup lang="ts">

defineProps<{
    title: string,
    description?: string
}>()
</script>

<style scoped>

</style>