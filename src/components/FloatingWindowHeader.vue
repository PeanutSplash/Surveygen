<template>
  <div class="drag-handle flex cursor-move select-none items-center justify-between bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-2 text-white shadow-sm">
    <div class="flex items-center space-x-2">
      <IconLogo class="h-4 w-4" />
      <span class="text-sm font-medium">Surveygen</span>
      <span class="rounded-full bg-white bg-opacity-20 px-1.5 py-0.5 text-xs">v{{ version }}</span>
    </div>
    <div class="flex items-center space-x-2">
      <button @click="toggleSettings" class="rounded-full bg-white bg-opacity-20 p-1 text-white transition-colors duration-200 hover:bg-opacity-30">
        <CogIcon class="h-5 w-5" />
      </button>
      <span class="text-xs opacity-75">已提交: {{ submissionCount }} 次</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CogIcon } from '@heroicons/vue/24/solid'
import IconLogo from '../assets/logo.svg'

defineProps<{
  version: string
  submissionCount: number
}>()

const emit = defineEmits<{
  (e: 'toggleSettings'): void
}>()

const toggleSettings = () => {
  emit('toggleSettings')
}
</script>
