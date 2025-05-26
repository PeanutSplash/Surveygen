<template>
  <div class="drag-handle flex cursor-move select-none items-center justify-between bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-2 text-white shadow-sm">
    <div class="flex items-center space-x-2">
      <IconLogo class="h-4 w-4" />
      <span class="text-sm font-medium">Surveygen</span>
      <span class="rounded-full bg-white bg-opacity-20 px-1.5 py-0.5 text-xs">v{{ version }}</span>
    </div>
    <div class="flex items-center space-x-2">
      <button
        v-if="isAutoAnswerEnabled"
        @click="stopAutoAnswer"
        class="rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition-all duration-200 hover:bg-red-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      >
        <span class="flex items-center">
          <StopIcon class="mr-1 h-4 w-4" />
          停止提交
        </span>
      </button>
      <button
        @click="manualSubmit"
        class="rounded-full bg-white bg-opacity-20 px-3 py-1.5 text-xs font-semibold text-white transition-colors duration-200 hover:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
      >
        <span class="flex items-center"> 单次提交 </span>
      </button>
      <span class="text-xs opacity-75">已提交: {{ submissionCount }} 次</span>

      <button @click="handleToggleSettings" class="rounded-full bg-white bg-opacity-20 p-1 text-white transition-colors duration-200 hover:bg-opacity-30">
        <CogIcon class="h-5 w-5" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CogIcon, StopIcon } from '@heroicons/vue/24/solid'
import IconLogo from '../assets/logo.svg'
import { computed } from 'vue'
import { useSurveyStore } from '../stores/surveyStore'

const surveyStore = useSurveyStore()

defineProps<{
  version: string
  submissionCount: number
}>()

const emit = defineEmits<{
  (e: 'toggleSettings'): void
  (e: 'stopAutoAnswer'): void
  (e: 'manualSubmit'): void
}>()

const handleToggleSettings = (event: MouseEvent) => {
  event.stopPropagation()
  emit('toggleSettings')
}

const stopAutoAnswer = () => {
  emit('stopAutoAnswer')
}

const manualSubmit = () => {
  emit('manualSubmit')
}

const isAutoAnswerEnabled = computed(() => surveyStore.isAutoAnswerEnabled)
</script>
