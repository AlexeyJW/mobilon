<script setup lang="ts">
 async function fetchConnection() {
    try {
      const response = await $fetch('/api/sync/dclink/dclink-test', {
        method: 'POST'
      })
      console.log('Connection successful:', response)
    } catch (error) {
      console.error('Connection failed:', error)
    }
  }

  fetchConnection()
</script>

<template>
  <div class="p-10">
    {{response}}
  </div>
</template>