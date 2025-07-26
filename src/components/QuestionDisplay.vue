<template>
  <div ref="questionRef" class="question mx-auto mb-6 max-w-6xl rounded-lg bg-[#fefefe] p-6 text-left transition-all duration-300 ease-in-out hover:shadow-lg">
    <!-- 问题标题和类型 -->
    <div class="mb-4 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <h3 class="text-sm font-medium text-gray-700">{{ question.index }}. {{ question.title }}</h3>
        <span :class="['rounded-md px-2 py-1 text-xs font-medium tracking-wide', getQuestionTypeClass(question.type)]">
          {{ getQuestionTypeLabel(question.type) }}
        </span>
        <!-- 量表题概率提示图标 -->
        <div v-if="surveyStore.isAdvancedMode && question.type === 'scale'" class="group relative">
          <div class="flex h-4 w-4 cursor-help items-center justify-center text-gray-400 hover:text-gray-600">
            <span class="text-xs">?</span>
          </div>
          <!-- Tooltip -->
          <div
            class="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden w-64 -translate-x-1/2 transform rounded-lg bg-gray-900 px-3 py-2 text-xs text-white shadow-lg group-hover:block"
          >
            <div class="mb-2 text-center font-medium text-gray-200">概率视觉指南</div>
            <div class="mb-2 flex items-center justify-between">
              <span class="text-gray-300">低</span>
              <div class="flex space-x-0">
                <div class="h-2 w-3 bg-blue-300"></div>
                <div class="h-2 w-3 bg-blue-400"></div>
                <div class="h-2 w-3 bg-blue-500"></div>
                <div class="h-2 w-3 bg-blue-600"></div>
                <div class="h-2 w-3 bg-blue-700"></div>
              </div>
              <span class="text-gray-300">高</span>
            </div>
            <p class="text-center text-gray-300">按钮颜色深度表示选择该选项的概率高低</p>
            <!-- Tooltip Arrow -->
            <div class="absolute left-1/2 top-full -translate-x-1/2 transform">
              <div class="border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="surveyStore.isAdvancedMode" class="flex items-center space-x-1">
        <button v-if="shouldShowRandomButton" @click="randomizeQuestion" class="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700 hover:bg-gray-200">
          随机
        </button>
        <template
          v-if="
            shouldShowEditProbabilityButton &&
            (question.type === 'radio' ||
              question.type === 'checkbox' ||
              question.type === 'select' ||
              question.type === 'scale' ||
              question.type === 'textarea' ||
              question.type === 'matrix' ||
              question.type === 'matrix-multiple')
          "
        >
          <template v-if="!isEditingProbability">
            <button @click="startEditProbability" class="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700 hover:bg-gray-200">编辑概率</button>
          </template>
        </template>
      </div>
    </div>

    <!-- 单选题和多选题 -->
    <div
      v-if="question.type === 'radio' || question.type === 'checkbox'"
      :class="['mt-4', hasInputOptions ? 'space-y-4' : 'grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4 space-y-0']"
    >
      <div
        v-for="(option, index) in question.options"
        :key="option.value"
        :class="[
          'rounded-lg p-3 transition-all duration-200 ease-in-out',
          surveyStore.isAdvancedMode ? 'cursor-default border border-gray-200 bg-[#fefefe]' : '',
          !surveyStore.isAdvancedMode
            ? [
                'cursor-pointer',
                option.isSelected ? 'border-2 border-indigo-300 bg-indigo-50 shadow-sm' : 'border border-gray-200 bg-[#fefefe]',
                !option.isSelected ? 'hover:border-indigo-200 hover:bg-indigo-50 hover:shadow-sm' : '',
              ]
            : '',
        ]"
        @click="!surveyStore.isAdvancedMode && handleOptionClick(option.text)"
      >
        <span
          :class="[
            surveyStore.isAdvancedMode ? 'text-gray-700' : '',
            !surveyStore.isAdvancedMode && option.isSelected ? 'font-medium text-indigo-700' : 'text-gray-700',
          ]"
        >
          {{ option.text }}
        </span>

        <div v-if="option.hasInput && option.isSelected" class="mt-2">
          <template v-if="option.inputs?.length === 1 || !surveyStore.isAdvancedMode">
            <input
              :id="`input-${index}-0`"
              v-model="option.inputs![0].value"
              type="text"
              class="block w-full rounded-md border-gray-300 p-2 text-sm leading-5 text-gray-900 shadow-sm hover:border-blue-500 focus:outline-[#2534DE]"
              @click.stop
              @input="updateOptionInput(index, 0, $event)"
            />
          </template>
          <template v-else>
            <div class="isolate -space-y-px rounded-md shadow-sm">
              <div
                v-for="(input, inputIndex) in option.inputs"
                :key="inputIndex"
                :class="[
                  'relative bg-white px-3 pb-1.5 pt-2.5 ring-1 ring-inset ring-gray-300',
                  inputIndex === 0 ? 'rounded-t-md' : '',
                  inputIndex === (option.inputs?.length ?? 0) - 1 ? 'rounded-b-md' : '',
                ]"
              >
                <label :for="`input-${index}-${inputIndex}`" class="block text-xs font-medium text-gray-900"> 答案 {{ inputIndex + 1 }} </label>
                <div class="flex items-center space-x-2">
                  <input
                    :id="`input-${index}-${inputIndex}`"
                    v-model="input.value"
                    type="text"
                    class="flex-grow rounded-md border border-gray-300 px-2 py-1 text-sm leading-6 text-gray-900 hover:border-blue-500 focus:outline-[#2534DE]"
                    @click.stop
                    @input="updateOptionInput(index, inputIndex, $event)"
                  />
                  <!-- 选项概率编辑功能待实现 -->
                  <!-- <div class="flex gap-2">
                    <p class="text-xs text-gray-500">选项概率:</p>
                    <CustomNumberInput v-model="test" class="w-16" />
                  </div> -->
                </div>
              </div>
            </div>
          </template>
          <div v-if="surveyStore.isAdvancedMode" class="mt-2 flex justify-between">
            <button @click.stop="addInput(option)" class="rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-100">
              添加更多答案
            </button>
            <button
              v-if="(option.inputs?.length ?? 0) > 1"
              @click.stop="removeInput(option)"
              class="rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
            >
              删除
            </button>
          </div>
        </div>
        <!-- 高级模式：概率设置 -->
        <div v-if="surveyStore.isAdvancedMode" class="mt-2 space-y-2">
          <label class="text-xs text-gray-500">概率：</label>
          <template v-if="isEditingProbability">
            <CustomNumberInput v-model="editedProbabilities[index]" :min="0" :max="100" class="w-16" />
          </template>
          <template v-else>
            <span class="text-xs text-gray-700">{{ option.probability }}%</span>
          </template>
        </div>
      </div>
    </div>

    <!-- 矩阵题和矩阵多选题 -->
    <div v-else-if="question.type === 'matrix' || question.type === 'matrix-multiple'" class="mt-4 space-y-4">
      <table class="min-w-full divide-y divide-gray-200 text-xs">
        <!-- 表头 -->
        <thead class="bg-gray-50">
          <tr>
            <th class="w-1/4 px-4 py-2 text-center text-xs font-medium uppercase tracking-wider text-gray-500"></th>
            <th v-for="header in question.headers" :key="header" class="px-4 py-2 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
              {{ header }}
            </th>
          </tr>
        </thead>
        <!-- 表体 -->
        <tbody class="divide-y divide-gray-200 bg-[#fefefe]">
          <tr v-for="row in question.rows" :key="row.title">
            <td class="w-1/4 whitespace-nowrap px-4 py-2 font-medium text-gray-900">{{ row.title }}</td>
            <td v-for="(option, index) in row.options" :key="index" class="cursor-pointer whitespace-nowrap px-2 py-2 text-center">
              <div class="flex items-center justify-center rounded-md px-2 py-1 transition-colors duration-200" :style="getMatrixProbabilityStyle(row, option)">
                <input
                  :type="question.type === 'matrix' ? 'radio' : 'checkbox'"
                  :name="row.title"
                  :checked="option.isSelected"
                  :class="['h-4 w-4', question.type !== 'matrix' ? 'rounded' : '']"
                  @change="handleMatrixOptionClick(row, option)"
                  :disabled="surveyStore.isAdvancedMode"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 高级模式概率管理 -->
      <div v-if="surveyStore.isAdvancedMode" class="space-y-3">
        <!-- 概率编辑器 -->
        <ProbabilityEditor
          v-if="isEditingProbability"
          :mode="probabilityEditMode"
          :options="flattenedMatrixOptions"
          :selected-range="selectedRange"
          @mode-change="probabilityEditMode = $event"
          @update:selected-range="selectedRange = $event"
          @apply-preset="handleMatrixApplyPreset"
          @apply-range="handleMatrixApplyRange"
        />

        <!-- 矩阵概率列表 -->
        <MatrixProbabilityList
          :rows="question.rows || []"
          :edited-probabilities="editedMatrixProbabilities"
          :is-editing="isEditingProbability"
          :edit-mode="probabilityEditMode"
          :get-probability-style="getMatrixProbabilityStyle"
          @update-probability="handleMatrixUpdateProbability"
        />
      </div>
    </div>

    <!-- 文本题 -->
    <div v-else-if="question.type === 'textarea'" class="mt-4">
      <template v-if="surveyStore.isAdvancedMode">
        <template v-if="!question.textareaInputs || question.textareaInputs.length <= 1">
          <input
            :id="`textarea-input-0`"
            v-model="question.textareaInputs![0].value"
            type="text"
            class="block w-full rounded-md border border-gray-300 p-2 text-sm leading-5 text-gray-900 shadow-sm hover:border-blue-500 focus:outline-[#2534DE]"
            @input="updateTextareaValue()"
          />
        </template>
        <template v-else>
          <div class="isolate -space-y-px rounded-md shadow-sm">
            <div
              v-for="(input, index) in question.textareaInputs"
              :key="index"
              :class="[
                'relative bg-white px-3 pb-1.5 pt-2.5 ring-1 ring-inset ring-gray-300',
                index === 0 ? 'rounded-t-md' : '',
                index === (question.textareaInputs?.length ?? 0) - 1 ? 'rounded-b-md' : '',
              ]"
            >
              <label :for="`textarea-input-${index}`" class="block text-xs font-medium text-gray-900">答案 {{ index + 1 }}</label>
              <div class="flex items-center space-x-2">
                <input
                  :id="`textarea-input-${index}`"
                  v-model="input.value"
                  type="text"
                  class="my-1 block w-full rounded-md border border-gray-300 px-2 py-1 text-sm leading-6 text-gray-900 hover:border-blue-500 focus:outline-[#2534DE]"
                  @input="updateTextareaValue()"
                />
                <!-- 文本题概率编辑 -->
                <div v-if="surveyStore.isAdvancedMode" class="flex gap-2 text-nowrap">
                  <p class="text-xs text-gray-500">概率:</p>
                  <template v-if="isEditingProbability">
                    <CustomNumberInput v-model="editedProbabilities[index]" :min="0" :max="100" class="w-16" />
                  </template>
                  <template v-else>
                    <span class="text-xs text-gray-700">{{ input.probability || 0 }}%</span>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </template>
        <div class="mt-2 space-y-2">
          <!-- 快速填入选项 -->
          <QuickFillButtons @fill="fillQuickText" />
          <div class="flex justify-between">
            <button @click="addTextareaInput" class="rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-100">
              添加更多答案
            </button>
            <button
              v-if="question.textareaInputs && question.textareaInputs.length > 1"
              @click="removeTextareaInput(question.textareaInputs.length - 1)"
              class="rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
            >
              删除
            </button>
          </div>
        </div>
      </template>
      <template v-else>
        <input
          v-model="question.textareaValue"
          type="text"
          class="w-full rounded-md border border-gray-300 p-2 hover:border-blue-500 focus:outline-[#2534DE]"
          @input="updateTextareaValue"
        />
        <!-- 普通模式下的快速填入选项 -->
        <div class="mt-2">
          <QuickFillButtons @fill="fillQuickText" />
        </div>
      </template>
    </div>

    <!-- 下拉选择题 -->
    <div v-else-if="question.type === 'select'" class="mt-4">
      <select v-model="selectedValue" class="w-full rounded-md border border-gray-300 p-2" :disabled="surveyStore.isAdvancedMode">
        <option v-for="option in question.selectOptions" :key="option.value" :value="option.value">
          {{ option.text }}
        </option>
      </select>

      <!-- 高级模式：概率设置 -->
      <div v-if="surveyStore.isAdvancedMode" class="mt-4 space-y-2">
        <div v-for="(option, idx) in question.selectOptions" :key="option.value" class="flex items-center justify-between rounded-md bg-gray-50 p-2">
          <span class="text-sm text-gray-700">{{ option.text }}</span>
          <div class="flex items-center space-x-2">
            <span class="text-xs text-gray-500">概率：</span>
            <template v-if="isEditingProbability">
              <CustomNumberInput v-model="editedProbabilities[idx]" :min="0" :max="100" class="w-20" inputClass="text-sm" />
            </template>
            <template v-else>
              <span class="text-xs text-gray-700">{{ option.probability }}%</span>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- 量表题 -->
    <ScaleQuestion
      v-else-if="question.type === 'scale'"
      :question="question"
      :is-advanced-mode="surveyStore.isAdvancedMode"
      :selected-scale-value="selectedScaleValue"
      :is-editing-probability="isEditingProbability"
      :probability-edit-mode="probabilityEditMode"
      :selected-range="selectedRange"
      :edited-probabilities="editedProbabilities"
      :get-probability-style="getProbabilityStyle"
      @option-click="handleScaleOptionClick"
      @apply-preset="handleApplyPreset"
      @apply-range="handleApplyRange"
      @mode-change="probabilityEditMode = $event"
      @update-selected-range="selectedRange = $event"
      @update-probability="handleUpdateProbability"
    />

    <!-- 未知题型 -->
    <div v-else class="mt-4 rounded-md border border-yellow-200 bg-yellow-50 p-4">
      <p class="mb-2 font-medium text-yellow-700">未知题型</p>
      <p class="text-sm text-yellow-600">这是一个未识别的问题类型。我们正在努力支持更多的问题类型。</p>
      <details class="mt-2">
        <summary class="cursor-pointer text-sm text-yellow-600 hover:underline">查看原始内容</summary>
        <div class="mt-2 max-h-40 overflow-auto rounded border border-yellow-200 bg-[#fefefe] p-2 text-xs text-gray-600" v-html="question.unknownContent"></div>
      </details>
    </div>

    <!-- Sticky 保存按钮区域 -->
    <div v-if="surveyStore.isAdvancedMode && isEditingProbability" class="sticky bottom-4 mt-6 flex justify-center">
      <div class="flex space-x-2 rounded-lg bg-white px-4 py-2 shadow-lg ring-1 ring-black ring-opacity-5">
        <button
          @click="saveProbability"
          class="rounded bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          保存概率设置
        </button>
        <button
          @click="cancelEditProbability"
          class="rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          取消
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import type { Question, MatrixRow, Option, ScaleOption } from '../types/survey'
import { useSurveyStore } from '../stores/surveyStore'
import CustomNumberInput from './CustomNumberInput.vue'
import eventBus from '../utils/eventBus'
import { calculatePresetDistribution, calculateRangeDistribution, type DistributionType } from '../utils/probabilityDistribution'
import ScaleQuestion from './ScaleQuestion.vue'
import QuickFillButtons from './QuickFillButtons.vue'
import ProbabilityEditor, { type RangeConfig } from './ProbabilityEditor.vue'
import MatrixProbabilityList from './MatrixProbabilityList.vue'

const props = defineProps<{
  question: Question
}>()

const surveyStore = useSurveyStore()

const questionRef = ref<HTMLElement | null>(null)
const textareaValue = ref(props.question.textareaValue || '')

const selectedValue = computed({
  get: () => props.question.selectedValue || '',
  set: (value: string) => {
    handleSelectChange(value)
  },
})

const selectedScaleValue = ref(0)

// 根据概率计算颜色样式
const getProbabilityStyle = (option: ScaleOption): Record<string, string> => {
  if (!surveyStore.isAdvancedMode) {
    return {
      backgroundColor: '',
      color: '',
    }
  }

  // 获取当前概率值：编辑模式下且非精确调整时使用编辑中的值
  let probability = option.probability || 0
  if (isEditingProbability.value && probabilityEditMode.value !== 'manual') {
    const optionIndex = props.question.scaleOptions?.findIndex(o => o.value === option.value) ?? -1
    if (optionIndex >= 0 && editedProbabilities.value[optionIndex] !== undefined) {
      probability = editedProbabilities.value[optionIndex]
    }
  }

  // 获取最大概率用于计算相对强度
  let maxProbability: number
  if (isEditingProbability.value && probabilityEditMode.value !== 'manual') {
    maxProbability = Math.max(...editedProbabilities.value.filter(p => p !== undefined))
  } else {
    maxProbability = Math.max(...(props.question.scaleOptions?.map(o => o.probability || 0) || [0]))
  }

  if (probability === 0) {
    return {
      backgroundColor: '#f3f4f6', // gray-100
      color: '#6b7280', // gray-500
    }
  }

  // 根据概率计算颜色强度
  const intensity = maxProbability > 0 ? probability / maxProbability : 0

  // 使用蓝色渐变，从浅到深
  if (intensity >= 0.8) {
    return {
      backgroundColor: '#1d4ed8', // blue-700
      color: '#ffffff',
    }
  } else if (intensity >= 0.6) {
    return {
      backgroundColor: '#2563eb', // blue-600
      color: '#ffffff',
    }
  } else if (intensity >= 0.4) {
    return {
      backgroundColor: '#3b82f6', // blue-500
      color: '#ffffff',
    }
  } else if (intensity >= 0.2) {
    return {
      backgroundColor: '#60a5fa', // blue-400
      color: '#ffffff',
    }
  } else {
    return {
      backgroundColor: '#93c5fd', // blue-300
      color: '#1e40af', // blue-800
    }
  }
}

// 为矩阵题选项计算颜色样式（按行独立计算）
const getMatrixProbabilityStyle = (row: MatrixRow, option: Option): Record<string, string> => {
  if (!surveyStore.isAdvancedMode) {
    return {
      backgroundColor: '',
      color: '',
    }
  }

  if (!props.question.rows) {
    return { backgroundColor: '', color: '' }
  }

  const rowIndex = props.question.rows.findIndex(r => r.title === row.title)
  const optionIndex = row.options.findIndex(o => o === option)

  // 获取当前概率值：编辑模式下且非精确调整时使用编辑中的值
  let probability = option.probability || 0
  if (isEditingProbability.value && probabilityEditMode.value !== 'manual') {
    const editedRowProbabilities = editedMatrixProbabilities.value[rowIndex]
    if (editedRowProbabilities && editedRowProbabilities[optionIndex] !== undefined) {
      probability = editedRowProbabilities[optionIndex]
    }
  }

  // 获取该行内的最大概率用于计算相对强度
  let maxProbabilityInRow: number
  if (isEditingProbability.value && probabilityEditMode.value !== 'manual') {
    const editedRowProbabilities = editedMatrixProbabilities.value[rowIndex] || []
    maxProbabilityInRow = Math.max(...editedRowProbabilities.filter(p => p !== undefined && p !== null))
  } else {
    maxProbabilityInRow = Math.max(...row.options.map(o => o.probability || 0))
  }

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

const isEditingProbability = ref(false)
const editedProbabilities = ref<number[]>([])
const editedMatrixProbabilities = ref<number[][]>([])
const probabilityEditMode = ref<'quick' | 'range' | 'manual'>('quick')
const selectedRange = ref<RangeConfig>({ start: 0, end: 0, weight: 70 })

const hasInputOptions = computed(() => {
  return props.question.options?.some(option => option.hasInput) || false
})

// 判断是否应该显示随机按钮
const shouldShowRandomButton = computed(() => {
  if (props.question.type === 'radio' || props.question.type === 'checkbox') {
    return (props.question.options?.length || 0) > 1
  } else if (props.question.type === 'matrix' || props.question.type === 'matrix-multiple') {
    return (props.question.rows?.length || 0) > 0 && (props.question.rows?.[0]?.options?.length || 0) > 1
  } else if (props.question.type === 'select') {
    return (props.question.selectOptions?.length || 0) > 1
  } else if (props.question.type === 'scale') {
    return (props.question.scaleOptions?.length || 0) > 1
  } else if (props.question.type === 'textarea') {
    return (props.question.textareaInputs?.length || 0) > 1
  }
  return true
})

// 判断是否应该显示编辑概率按钮
const shouldShowEditProbabilityButton = computed(() => {
  if (props.question.type === 'radio' || props.question.type === 'checkbox') {
    return (props.question.options?.length || 0) > 1
  } else if (props.question.type === 'matrix' || props.question.type === 'matrix-multiple') {
    return (props.question.rows?.length || 0) > 0 && (props.question.rows?.[0]?.options?.length || 0) > 1
  } else if (props.question.type === 'select') {
    return (props.question.selectOptions?.length || 0) > 1
  } else if (props.question.type === 'scale') {
    return (props.question.scaleOptions?.length || 0) > 1
  } else if (props.question.type === 'textarea') {
    return (props.question.textareaInputs?.length || 0) > 1
  }
  return true
})

// 为矩阵题创建扁平化选项（用于概率编辑器）
const flattenedMatrixOptions = computed(() => {
  if (!props.question.rows) return []
  return props.question.rows.flatMap(row =>
    row.options.map((option, optionIndex) => ({
      value: optionIndex + 1,
      label: `选项${optionIndex + 1}`,
      probability: option.probability,
      isSelected: option.isSelected,
    })),
  )
})

let observer: MutationObserver | null = null

const updateTextareaValue = () => {
  if (surveyStore.isAdvancedMode) {
    if (props.question.textareaInputs) {
      surveyStore.updateQuestionTextareaInputs(props.question.index, props.question.textareaInputs)
    }
  } else {
    surveyStore.updateQuestionTextarea(props.question.index, props.question.textareaValue || '')
  }
}

const handleOptionClick = (optionText: string) => {
  if (surveyStore.isAdvancedMode) return
  if (props.question.type === 'radio') {
    // 单选逻辑
    props.question.options?.forEach(option => {
      option.isSelected = option.text === optionText
      if (option.hasInput) {
        if (!option.isSelected) {
          option.inputs = [{ value: '' }] // 重置未选中选项的输入值
        } else if (!option.inputs || option.inputs.length === 0) {
          option.inputs = [{ value: '' }] // 为新选中的选项初始化输入数组
        }
      }
    })
  } else if (props.question.type === 'checkbox') {
    // 多选题逻辑
    const option = props.question.options?.find(o => o.text === optionText)
    if (option) {
      option.isSelected = !option.isSelected
      if (option.hasInput) {
        if (!option.isSelected) {
          option.inputs = [{ value: '' }] // 重置未选中选项的输入值
        } else if (!option.inputs || option.inputs.length === 0) {
          option.inputs = [{ value: '' }] // 为新选中的选项初始化输入数组
        }
      }
    }
  }

  // 更新问题选项
  surveyStore.updateQuestionOptions(props.question.index, props.question.options || [])
}

const handleMatrixOptionClick = (row: MatrixRow, clickedOption: Option) => {
  if (surveyStore.isAdvancedMode) return
  if (props.question.type === 'matrix') {
    // 单选逻辑
    row.options.forEach((option: Option) => {
      option.isSelected = option === clickedOption
    })
  } else if (props.question.type === 'matrix-multiple') {
    // 多选逻辑
    clickedOption.isSelected = !clickedOption.isSelected
  }
  if (props.question.rows) {
    surveyStore.updateQuestionMatrix(props.question.index, props.question.rows)
  }
}

const handleSelectChange = (value: string) => {
  if (props.question.selectOptions) {
    props.question.selectOptions.forEach(option => {
      option.isSelected = option.value === value
      option.probability = option.isSelected ? 100 : 0
    })
    // 更新当前问题的数据
    surveyStore.updateQuestionSelectOptions(props.question.index, props.question.selectOptions, value)
  }
}

const handleScaleOptionClick = (clickedOption: ScaleOption) => {
  if (surveyStore.isAdvancedMode) return
  if (props.question.type === 'scale' && props.question.scaleOptions) {
    selectedScaleValue.value = clickedOption.value
    props.question.scaleOptions.forEach(option => {
      option.isSelected = option.value === clickedOption.value
    })
    surveyStore.updateQuestionScaleOptions(props.question.index, props.question.scaleOptions)
  }
}

// 初始化选中值
// 在件挂载时或 props 变化时调用此函数
const initializeSelectedValue = () => {
  if (props.question.type === 'scale' && props.question.scaleOptions) {
    const maxSelectedOption = props.question.scaleOptions.reduce((max, option) => (option.isSelected && option.value > max ? option.value : max), 0)
    selectedScaleValue.value = maxSelectedOption
  }
}

// 监听 props.question 的变化
watch(() => props.question, initializeSelectedValue, { immediate: true })

onMounted(() => {
  if (props.question.type === 'textarea' && props.question.textareaId) {
    const textarea = document.getElementById(props.question.textareaId)
    if (textarea) {
      observer = new MutationObserver(() => updateTextareaValue())
      observer.observe(textarea, { attributes: true, childList: true, characterData: true, subtree: true })

      // 添加输入事件监听器
      textarea.addEventListener('input', () => updateTextareaValue())
    }
  }
  initializeSelectedValue()
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
  if (props.question.type === 'textarea' && props.question.textareaId) {
    const textarea = document.getElementById(props.question.textareaId)
    if (textarea) {
      textarea.removeEventListener('input', () => updateTextareaValue())
    }
  }
})

watch(
  () => props.question.textareaValue,
  newValue => {
    textareaValue.value = newValue || ''
  },
)

const randomizeQuestion = () => {
  if (props.question.options) {
    randomizeOptions(props.question.options)
    if (isEditingProbability.value) {
      editedProbabilities.value = props.question.options.map(o => o.probability)
    }
  } else if (props.question.rows) {
    props.question.rows.forEach(row => randomizeOptions(row.options))
    if (isEditingProbability.value) {
      editedMatrixProbabilities.value = props.question.rows.map(row => row.options.map(option => option.probability))
    }
  } else if (props.question.selectOptions) {
    randomizeOptions(props.question.selectOptions)
    if (isEditingProbability.value) {
      editedProbabilities.value = props.question.selectOptions.map(o => o.probability)
    }
  } else if (props.question.scaleOptions) {
    randomizeOptions(props.question.scaleOptions)
    if (isEditingProbability.value) {
      editedProbabilities.value = props.question.scaleOptions.map(o => o.probability)
    }
  } else if (props.question.textareaInputs) {
    randomizeTextareaOptions(props.question.textareaInputs)
    if (isEditingProbability.value) {
      editedProbabilities.value = props.question.textareaInputs.map(input => input.probability || 0)
    }
  }

  if (props.question.options) {
    surveyStore.updateQuestionOptions(props.question.index, props.question.options || [])
  } else if (props.question.rows) {
    surveyStore.updateQuestionMatrix(props.question.index, props.question.rows)
  } else if (props.question.selectOptions) {
    surveyStore.updateQuestionSelectOptions(props.question.index, props.question.selectOptions, props.question.selectedValue || '')
  } else if (props.question.scaleOptions) {
    surveyStore.updateQuestionScaleOptions(props.question.index, props.question.scaleOptions)
  } else if (props.question.textareaInputs) {
    surveyStore.updateQuestionTextareaInputs(props.question.index, props.question.textareaInputs)
  }
}

const randomizeOptions = (options: any[]) => {
  const total = options.length
  let remaining = 100
  options.forEach((option, index) => {
    if (index === total - 1) {
      option.probability = remaining
    } else {
      const randomProb = Math.floor(Math.random() * (remaining - (total - index - 1))) + 1
      option.probability = randomProb
      remaining -= randomProb
    }
  })
}

const randomizeTextareaOptions = (inputs: { value: string; probability?: number }[]) => {
  const total = inputs.length
  let remaining = 100
  inputs.forEach((input, index) => {
    if (index === total - 1) {
      input.probability = remaining
    } else {
      const randomProb = Math.floor(Math.random() * (remaining - (total - index - 1))) + 1
      input.probability = randomProb
      remaining -= randomProb
    }
  })
}

const startEditProbability = () => {
  if (props.question.options) {
    editedProbabilities.value = props.question.options.map(o => o.probability)
  } else if (props.question.selectOptions) {
    editedProbabilities.value = props.question.selectOptions.map(o => o.probability)
  } else if (props.question.scaleOptions) {
    editedProbabilities.value = props.question.scaleOptions.map(o => o.probability)
    // 初始化区间设置
    selectedRange.value = {
      start: 0,
      end: Math.max(0, props.question.scaleOptions.length - 1),
      weight: 70,
    }
  } else if (props.question.textareaInputs) {
    editedProbabilities.value = props.question.textareaInputs.map(input => input.probability || 0)
  } else if (props.question.rows) {
    // 矩阵题：创建编辑用的概率数组
    editedMatrixProbabilities.value = props.question.rows.map(row => row.options.map(option => option.probability))
  }
  probabilityEditMode.value = 'quick'
  isEditingProbability.value = true
}

// 处理预设分布应用
const handleApplyPreset = (type: DistributionType) => {
  if (props.question.scaleOptions) {
    const probabilities = calculatePresetDistribution(type, props.question.scaleOptions.length)
    editedProbabilities.value = probabilities
  }
}

// 处理区间设置应用
const handleApplyRange = () => {
  if (props.question.scaleOptions && selectedRange.value.weight > 0 && selectedRange.value.weight <= 100) {
    const probabilities = calculateRangeDistribution(
      selectedRange.value.start,
      selectedRange.value.end,
      selectedRange.value.weight,
      props.question.scaleOptions.length,
    )
    editedProbabilities.value = probabilities
  }
}

// 处理概率更新
const handleUpdateProbability = (data: { index: number; value: number }) => {
  editedProbabilities.value[data.index] = data.value
}

// 矩阵题专用处理函数
const handleMatrixApplyPreset = (type: DistributionType) => {
  if (!props.question.rows) return

  props.question.rows.forEach((row, rowIndex) => {
    const probabilities = calculatePresetDistribution(type, row.options.length)
    if (!editedMatrixProbabilities.value[rowIndex]) {
      editedMatrixProbabilities.value[rowIndex] = []
    }
    probabilities.forEach((prob, optionIndex) => {
      editedMatrixProbabilities.value[rowIndex][optionIndex] = prob
    })
  })
}

const handleMatrixApplyRange = () => {
  if (!props.question.rows || selectedRange.value.weight <= 0 || selectedRange.value.weight > 100) return

  props.question.rows.forEach((row, rowIndex) => {
    const probabilities = calculateRangeDistribution(selectedRange.value.start, selectedRange.value.end, selectedRange.value.weight, row.options.length)
    if (!editedMatrixProbabilities.value[rowIndex]) {
      editedMatrixProbabilities.value[rowIndex] = []
    }
    probabilities.forEach((prob, optionIndex) => {
      editedMatrixProbabilities.value[rowIndex][optionIndex] = prob
    })
  })
}

const handleMatrixUpdateProbability = (data: { rowIndex: number; optionIndex: number; value: number }) => {
  if (!editedMatrixProbabilities.value[data.rowIndex]) {
    editedMatrixProbabilities.value[data.rowIndex] = []
  }
  editedMatrixProbabilities.value[data.rowIndex][data.optionIndex] = data.value
}

const saveProbability = () => {
  if (props.question.rows) {
    // 矩阵题：验证每行概率总和
    let hasError = false
    for (let rowIndex = 0; rowIndex < props.question.rows.length; rowIndex++) {
      const rowProbabilities = editedMatrixProbabilities.value[rowIndex] || []
      const total = rowProbabilities.reduce((sum, p) => sum + Number(p || 0), 0)
      if (total !== 100) {
        eventBus.emit('showToast', { message: `第${rowIndex + 1}行概率总和必须等于100，当前为${total}`, type: 'warning' })
        hasError = true
        break
      }
    }
    if (hasError) return

    // 保存矩阵题概率
    props.question.rows.forEach((row, rowIndex) => {
      row.options.forEach((option, optionIndex) => {
        option.probability = Number(editedMatrixProbabilities.value[rowIndex]?.[optionIndex] || 0)
      })
    })
    surveyStore.updateQuestionMatrix(props.question.index, props.question.rows)
  } else {
    // 其他题型：验证概率总和
    const total = editedProbabilities.value.reduce((sum, p) => sum + Number(p), 0)
    if (total !== 100) {
      eventBus.emit('showToast', { message: '概率总和必须等于100', type: 'warning' })
      return
    }

    if (props.question.options) {
      props.question.options.forEach((option, idx) => {
        option.probability = Number(editedProbabilities.value[idx])
      })
      surveyStore.updateQuestionOptions(props.question.index, props.question.options)
    } else if (props.question.selectOptions) {
      props.question.selectOptions.forEach((option, idx) => {
        option.probability = Number(editedProbabilities.value[idx])
      })
      surveyStore.updateQuestionSelectOptions(props.question.index, props.question.selectOptions, props.question.selectedValue || '')
    } else if (props.question.scaleOptions) {
      props.question.scaleOptions.forEach((option, idx) => {
        option.probability = Number(editedProbabilities.value[idx])
      })
      surveyStore.updateQuestionScaleOptions(props.question.index, props.question.scaleOptions)
    } else if (props.question.textareaInputs) {
      props.question.textareaInputs.forEach((input, idx) => {
        input.probability = Number(editedProbabilities.value[idx])
      })
      surveyStore.updateQuestionTextareaInputs(props.question.index, props.question.textareaInputs)
    }
  }

  surveyStore.saveData()
  isEditingProbability.value = false
  eventBus.emit('showToast', { message: '概率已保存', type: 'success' })
}

const cancelEditProbability = () => {
  isEditingProbability.value = false
}

const getQuestionTypeLabel = (type: string): string => {
  switch (type) {
    case 'radio':
      return '单选题'
    case 'checkbox':
      return '多选题'
    case 'matrix':
      return '矩阵题'
    case 'matrix-multiple':
      return '矩阵多选题'
    case 'textarea':
      return '文本题'
    case 'select':
      return '下拉选择题'
    case 'scale':
      return '量表题'
    default:
      return '未知题型'
  }
}

const getQuestionTypeClass = (type: string): string => {
  switch (type) {
    case 'radio':
      return 'bg-blue-50 text-blue-600 border border-blue-200'
    case 'checkbox':
      return 'bg-green-50 text-green-600 border border-green-200'
    case 'matrix':
      return 'bg-purple-50 text-purple-600 border border-purple-200'
    case 'matrix-multiple':
      return 'bg-pink-50 text-pink-600 border border-pink-200'
    case 'textarea':
      return 'bg-yellow-50 text-yellow-600 border border-yellow-200'
    case 'select':
      return 'bg-indigo-50 text-indigo-600 border border-indigo-200'
    case 'scale':
      return 'bg-orange-50 text-orange-600 border border-orange-200'
    default:
      return 'bg-gray-50 text-gray-600 border border-gray-200'
  }
}

const updateOptionInput = (optionIndex: number, inputIndex: number, event: Event) => {
  const inputValue = (event.target as HTMLInputElement).value
  if (props.question.options) {
    // @ts-ignore
    props.question.options[optionIndex].inputs[inputIndex].value = inputValue
    surveyStore.updateQuestionOptions(props.question.index, props.question.options)
  }
}

const addInput = (option: Option) => {
  if (!surveyStore.isAdvancedMode) return // 在普通模式下禁止添加输入框
  if (!option.inputs) {
    option.inputs = []
  }
  option.inputs.push({ value: '' })
  surveyStore.updateQuestionOptions(props.question.index, props.question.options || [])
}

const removeInput = (option: Option) => {
  if ((option.inputs?.length ?? 0) > 1) {
    option.inputs?.pop()
    surveyStore.updateQuestionOptions(props.question.index, props.question.options || [])
  }
}

const addTextareaInput = () => {
  if (!props.question.textareaInputs) {
    props.question.textareaInputs = [{ value: '', probability: 100 }]
  } else {
    props.question.textareaInputs.push({ value: '', probability: 0 })
  }
  surveyStore.updateQuestionTextareaInputs(props.question.index, props.question.textareaInputs)
}

const fillQuickText = (text: string) => {
  if (surveyStore.isAdvancedMode) {
    // 高级模式：填入到 textareaInputs
    if (props.question.textareaInputs && props.question.textareaInputs.length > 0) {
      // 填入到第一个空白输入框或最后一个输入框
      const emptyInput = props.question.textareaInputs.find(input => !input.value.trim())
      if (emptyInput) {
        emptyInput.value = text
      } else {
        props.question.textareaInputs[props.question.textareaInputs.length - 1].value = text
      }
    }
  } else {
    // 非高级模式：直接设置 textareaValue
    props.question.textareaValue = text
  }
  updateTextareaValue()
}

const removeTextareaInput = (index: number) => {
  if (props.question.textareaInputs && props.question.textareaInputs.length > 1) {
    props.question.textareaInputs.splice(index, 1)
    surveyStore.updateQuestionTextareaInputs(props.question.index, props.question.textareaInputs)
  }
}

defineExpose({ questionRef })
</script>

<style scoped>
.question {
  transition: box-shadow 0.3s ease-in-out;
}

.question:hover {
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
</style>
