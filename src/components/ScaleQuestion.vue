<template>
  <div class="mt-4">
    <!-- 标签 -->
    <div class="mb-2 flex items-center justify-between">
      <span class="text-sm text-gray-600">{{ question.minLabel }}</span>
      <span class="text-sm text-gray-600">{{ question.maxLabel }}</span>
    </div>

    <!-- 选项按钮 -->
    <template v-if="isStarRating">
      <!-- 星级评分显示 -->
      <div class="flex justify-center space-x-1">
        <button
          v-for="option in question.scaleOptions"
          :key="option.value"
          @click="!isAdvancedMode && $emit('optionClick', option)"
          :class="['h-6 w-6 transition-all duration-200 focus:outline-none', isAdvancedMode ? 'cursor-default' : 'cursor-pointer']"
          :style="isAdvancedMode ? getProbabilityStyle(option) : {}"
        >
          <!-- 星星图标 -->
          <svg
            :class="['h-6 w-6', !isAdvancedMode && isOptionSelected(option) ? 'fill-current text-blue-500' : 'text-gray-300']"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
            />
          </svg>
        </button>
      </div>
    </template>
    <template v-else>
      <!-- 数字量表显示 -->
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
    </template>

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

// 检测是否为星级评分类型
const isStarRating = computed(() => {
  const minLabel = props.question.minLabel?.toLowerCase() || ''
  const maxLabel = props.question.maxLabel?.toLowerCase() || ''

  // 检测常见的非数字标签
  const nonNumericLabels = [
    '不可能',
    '极有可能',
    '非常不同意',
    '非常同意',
    '完全不赞成',
    '完全赞成',
    '很不满意',
    '很满意',
    '从不',
    '总是',
    'never',
    'always',
    'strongly disagree',
    'strongly agree',
    'very unlikely',
    'very likely',
  ]

  return nonNumericLabels.some(label => minLabel.includes(label) || maxLabel.includes(label))
})
</script>
