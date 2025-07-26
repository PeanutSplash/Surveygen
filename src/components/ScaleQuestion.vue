<template>
  <div class="mt-4">
    <!-- 标签 -->
    <div class="mb-2 flex items-center justify-between">
      <span class="text-sm text-gray-600">{{ question.minLabel }}</span>
      <span class="text-sm text-gray-600">{{ question.maxLabel }}</span>
    </div>

    <!-- 选项按钮 -->
    <div class="flex justify-between">
      <button
        v-for="option in question.scaleOptions"
        :key="option.value"
        @click="!isAdvancedMode && $emit('optionClick', option)"
        :class="[
          'h-8 w-8 rounded-full text-sm font-medium transition-all duration-200 focus:outline-none',
          isAdvancedMode
            ? 'cursor-default'
            : [isOptionSelected(option) ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300', 'cursor-pointer'],
        ]"
        :style="isAdvancedMode ? getProbabilityStyle(option) : {}"
      >
        {{ option.value }}
      </button>
    </div>

    <!-- 高级模式概率管理 -->
    <div v-if="isAdvancedMode" class="mt-4 space-y-3">
      <!-- 概率编辑器 -->
      <ProbabilityEditor
        v-if="isEditingProbability"
        :mode="probabilityEditMode"
        :options="question.scaleOptions || []"
        :selected-range="selectedRange"
        @mode-change="$emit('modeChange', $event)"
        @update:selected-range="$emit('updateSelectedRange', $event)"
        @apply-preset="$emit('applyPreset', $event)"
        @apply-range="$emit('applyRange')"
      />

      <!-- 概率列表 -->
      <ScaleProbabilityList
        :options="question.scaleOptions || []"
        :edited-probabilities="editedProbabilities"
        :is-editing="isEditingProbability"
        :edit-mode="probabilityEditMode"
        :get-probability-style="getProbabilityStyle"
        @update-probability="$emit('updateProbability', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Question, ScaleOption } from '../types/survey'
import type { DistributionType } from '../utils/probabilityDistribution'
import ProbabilityEditor, { type RangeConfig } from './ProbabilityEditor.vue'
import ScaleProbabilityList from './ScaleProbabilityList.vue'

const props = defineProps<{
  question: Question
  isAdvancedMode: boolean
  selectedScaleValue: number
  isEditingProbability: boolean
  probabilityEditMode: 'quick' | 'range' | 'manual'
  selectedRange: RangeConfig
  editedProbabilities: number[]
  getProbabilityStyle: (option: ScaleOption) => Record<string, string>
}>()

defineEmits<{
  optionClick: [option: ScaleOption]
  applyPreset: [type: DistributionType]
  applyRange: []
  updateProbability: [data: { index: number; value: number }]
  modeChange: [mode: 'quick' | 'range' | 'manual']
  updateSelectedRange: [range: RangeConfig]
}>()

const isOptionSelected = computed(() => (option: ScaleOption) => {
  return option.value <= props.selectedScaleValue
})
</script>
