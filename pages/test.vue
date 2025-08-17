<template>
  <v-container class="d-flex flex-column align-center justify-center">
    <AIProviderTester />
  </v-container>
</template>

<script setup lang="ts">
import AIProviderTester from '@/components/AIProviderTester.vue'

// Page meta
definePageMeta({
  layout: 'default',
})
</script>
