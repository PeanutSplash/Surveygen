<template>
  <div class="space-y-4">
    <div v-for="(row, rowIndex) in rows" :key="row.title" class="rounded-lg border border-gray-200 bg-gray-50 p-3">
      <div class="mb-2 flex items-center justify-between">
        <h4 class="text-sm font-medium text-gray-700">{{ row.title }}</h4>
        <!-- 行操作按钮 -->
        <div v-if="isEditing" class="flex space-x-1">
          <button @click="distributeRowProbability(rowIndex)" class="rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600" title="平均分配">
            平均
          </button>
          <button @click="clearRowProbability(rowIndex)" class="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600" title="清零">清零</button>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <div
          v-for="(option, optionIndex) in row.options"
          :key="optionIndex"
          class="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-2 text-xs"
        >
          <div class="flex items-center space-x-1.5">
            <div
              class="h-2.5 w-2.5 rounded-full border border-gray-300"
              :style="{ backgroundColor: getProbabilityStyleForRow(rowIndex, optionIndex, option).backgroundColor || '#f3f4f6' }"
            ></div>
            <span class="font-medium text-gray-700">选项{{ optionIndex + 1 }}</span>
          </div>
          <div class="flex items-center">
            <template v-if="isEditing && editMode === 'manual'">
              <CustomNumberInput
                :model-value="editedProbabilities[rowIndex]?.[optionIndex] || 0"
                @update:model-value="$emit('updateProbability', { rowIndex, optionIndex, value: Number($event) })"
                :min="0"
                :max="100"
                class="w-12"
                inputClass="text-xs px-1 py-0.5"
              />
            </template>
            <template v-else>
              <span class="font-medium text-gray-600"> {{ Math.round(getCurrentProbability(rowIndex, optionIndex, option)) }}% </span>
            </template>
          </div>
        </div>
      </div>

      <!-- 该行概率总和显示 -->
      <div class="mt-2 text-right">
        <span class="text-xs" :class="getRowTotalClass(rowIndex)"> 总和: {{ getRowTotal(rowIndex) }}% </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MatrixRow, Option } from '../types/survey'
import CustomNumberInput from './CustomNumberInput.vue'

const props = defineProps<{
  rows: MatrixRow[]
  editedProbabilities: number[][]
  isEditing: boolean
  editMode: 'quick' | 'range' | 'manual'
  getProbabilityStyle: (row: MatrixRow, option: Option) => Record<string, string>
}>()

const emit = defineEmits<{
  updateProbability: [data: { rowIndex: number; optionIndex: number; value: number }]
}>()

// 获取当前概率值（编辑时使用编辑值，否则使用保存值）
const getCurrentProbability = (rowIndex: number, optionIndex: number, option: Option): number => {
  if (props.isEditing && props.editedProbabilities[rowIndex]?.[optionIndex] !== undefined) {
    return props.editedProbabilities[rowIndex][optionIndex] || 0
  }
  return option.probability || 0
}

// 计算每行概率总和
const getRowTotal = (rowIndex: number): number => {
  if (props.isEditing && props.editedProbabilities[rowIndex]) {
    // 编辑模式：使用编辑中的概率值
    return props.editedProbabilities[rowIndex].reduce((sum, prob) => sum + (prob || 0), 0)
  } else {
    // 非编辑模式：使用实际保存的概率值
    const row = props.rows[rowIndex]
    if (!row) return 0
    return row.options.reduce((sum, option) => sum + (option.probability || 0), 0)
  }
}

// 获取总和显示的CSS类
const getRowTotalClass = (rowIndex: number): string => {
  const total = getRowTotal(rowIndex)
  if (total === 100) return 'text-green-600'
  if (total > 100) return 'text-red-600'
  return 'text-orange-600'
}

// 平均分配该行概率
const distributeRowProbability = (rowIndex: number) => {
  const row = props.rows[rowIndex]
  if (!row) return

  const optionCount = row.options.length
  const avgProbability = Math.floor(100 / optionCount)
  const remainder = 100 % optionCount

  row.options.forEach((_, optionIndex) => {
    const value = avgProbability + (optionIndex < remainder ? 1 : 0)
    emit('updateProbability', { rowIndex, optionIndex, value })
  })
}

// 清零该行概率
const clearRowProbability = (rowIndex: number) => {
  const row = props.rows[rowIndex]
  if (!row) return

  row.options.forEach((_, optionIndex) => {
    emit('updateProbability', { rowIndex, optionIndex, value: 0 })
  })
}

// 为概率列表计算颜色样式（优先使用编辑中的值）
const getProbabilityStyleForRow = (rowIndex: number, optionIndex: number, option: Option): Record<string, string> => {
  // Use the same logic as getCurrentProbability for consistency
  const probability = getCurrentProbability(rowIndex, optionIndex, option)

  const row = props.rows[rowIndex]
  // Calculate max probability for the row using consistent logic
  const rowProbabilities = row.options.map((opt, idx) => getCurrentProbability(rowIndex, idx, opt))
  const maxProbabilityInRow = Math.max(0, ...rowProbabilities) // Ensure at least 0

  if (probability === 0) {
    return {
      backgroundColor: '#f3f4f6', // gray-100
      color: '#6b7280', // gray-500
    }
  }

  // 根据该行内的最大概率计算颜色强度
  const intensity = maxProbabilityInRow > 0 ? probability / maxProbabilityInRow : 0

  // 使用绿色渐变，从浅到深
  if (intensity >= 0.8) {
    return {
      backgroundColor: '#15803d', // green-700
      color: '#ffffff',
    }
  } else if (intensity >= 0.6) {
    return {
      backgroundColor: '#16a34a', // green-600
      color: '#ffffff',
    }
  } else if (intensity >= 0.4) {
    return {
      backgroundColor: '#22c55e', // green-500
      color: '#ffffff',
    }
  } else if (intensity >= 0.2) {
    return {
      backgroundColor: '#4ade80', // green-400
      color: '#ffffff',
    }
  } else {
    return {
      backgroundColor: '#86efac', // green-300
      color: '#166534', // green-800
    }
  }
}
</script>
