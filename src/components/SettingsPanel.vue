<template>
  <div class="absolute right-0 top-12 w-64 rounded-lg bg-white p-4 shadow-lg">
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-800">设置</h3>
      <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700">
        <XMarkIcon class="h-5 w-5" />
      </button>
    </div>
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-700">高级模式</span>
        <ToggleSwitch :is-active="isAdvancedMode" @toggle="$emit('toggle-mode')" />
      </div>
      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-700">自动提交</span>
        <ToggleSwitch :is-active="isAutoAnswerEnabled" @toggle="$emit('toggle-auto-answer')" />
      </div>
      <button
        v-if="isAdvancedMode"
        @click="$emit('randomize-all')"
        class="w-full rounded-lg bg-indigo-500 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-indigo-600"
      >
        随机所有问题
      </button>
      <button
        @click="$emit('reset-survey')"
        class="w-full rounded-lg bg-green-500 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-teal-700"
      >
        重新解析问卷
      </button>
      <div class="mt-4 text-xs text-gray-500">
        <p>提示: 按下 F3 键可以快速显示/隐藏面板</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { XMarkIcon } from '@heroicons/vue/24/solid'
import ToggleSwitch from './ToggleSwitch.vue'

defineProps<{
  isAdvancedMode: boolean
  isAutoAnswerEnabled: boolean
}>()

defineEmits<{
  (e: 'close'): void
  (e: 'toggle-mode'): void
  (e: 'toggle-auto-answer'): void
  (e: 'randomize-all'): void
  (e: 'reset-survey'): void
}>()
</script>
