<template>
  <div class="rounded-lg border border-gray-200 bg-gray-50 p-3">
    <div class="mb-3 flex items-center justify-between">
      <span class="text-sm font-medium text-gray-700">编辑模式</span>
      <div class="flex rounded-md border border-gray-200 bg-white p-1">
        <button
          @click="$emit('modeChange', 'quick')"
          :class="[
            'rounded px-3 py-1 text-xs font-medium transition-colors',
            mode === 'quick' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:text-gray-800',
          ]"
        >
          快速预设
        </button>
        <button
          @click="$emit('modeChange', 'range')"
          :class="[
            'rounded px-3 py-1 text-xs font-medium transition-colors',
            mode === 'range' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:text-gray-800',
          ]"
        >
          区间设置
        </button>
        <button
          @click="$emit('modeChange', 'manual')"
          :class="[
            'rounded px-3 py-1 text-xs font-medium transition-colors',
            mode === 'manual' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:text-gray-800',
          ]"
        >
          精确调整
        </button>
      </div>
    </div>

    <!-- 快速预设模式 -->
    <QuickPresetMode v-if="mode === 'quick'" @apply="$emit('applyPreset', $event)" />

    <!-- 区间设置模式 -->
    <RangeSettingMode
      v-if="mode === 'range'"
      :options="options"
      :selected-range="selectedRange"
      @update:selectedRange="$emit('update:selectedRange', $event)"
      @apply="$emit('applyRange')"
    />

    <!-- 精确调整模式 -->
    <div v-if="mode === 'manual'" class="space-y-2">
      <p class="text-xs text-gray-600">手动调整每个选项的精确概率</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ScaleOption } from '../types/survey'
import type { DistributionType } from '../utils/probabilityDistribution'
import QuickPresetMode from './probability-editor/QuickPresetMode.vue'
import RangeSettingMode from './probability-editor/RangeSettingMode.vue'

export interface RangeConfig {
  start: number
  end: number
  weight: number
}

defineProps<{
  mode: 'quick' | 'range' | 'manual'
  options: ScaleOption[]
  selectedRange: RangeConfig
}>()

defineEmits<{
  modeChange: [mode: 'quick' | 'range' | 'manual']
  applyPreset: [type: DistributionType]
  applyRange: []
  'update:selectedRange': [range: RangeConfig]
}>()
</script>
