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
        <template
          v-if="
            shouldShowEditProbabilityButtonComputed &&
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
          <template v-else>
            <!-- 只有在编辑概率模式下才显示随机按钮 -->
            <button
              v-if="shouldShowRandomButtonComputed"
              @click="randomizeQuestion"
              class="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700 hover:bg-gray-200"
            >
              随机
            </button>
          </template>
        </template>
      </div>
    </div>

    <!-- 单选题和多选题 -->
    <div v-if="question.type === 'radio' || question.type === 'checkbox'" :class="['mt-4', 'grid gap-3 space-y-0', getResponsiveGridClass]">
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
      <div v-if="surveyStore.isAdvancedMode" :class="['mt-4', 'grid gap-3 space-y-0', getResponsiveGridClass]">
        <div v-for="(option, idx) in question.selectOptions" :key="option.value" class="rounded-md bg-gray-50 p-3 transition-all duration-200 ease-in-out">
          <div class="mb-2">
            <span class="text-sm font-medium text-gray-700">{{ option.text }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-xs text-gray-500">概率：</span>
            <div class="flex-shrink-0">
              <template v-if="isEditingProbability">
                <CustomNumberInput v-model="editedProbabilities[idx]" :min="0" :max="100" class="w-16" inputClass="text-xs" />
              </template>
              <template v-else>
                <span class="text-xs font-medium text-gray-700">{{ option.probability }}%</span>
              </template>
            </div>
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
import type { Question } from '../types/survey'
import { useSurveyStore } from '../stores/surveyStore'
import CustomNumberInput from './CustomNumberInput.vue'
import ScaleQuestion from './ScaleQuestion.vue'
import QuickFillButtons from './QuickFillButtons.vue'
import ProbabilityEditor from './ProbabilityEditor.vue'
import MatrixProbabilityList from './MatrixProbabilityList.vue'

// 导入工具函数和 composables
import { getQuestionTypeLabel, getQuestionTypeClass } from '../utils/questionTypeHelpers'
import { calculateProbabilityStyle, calculateMatrixProbabilityStyle } from '../utils/probabilityStyles'
import { shouldShowRandomButton, shouldShowEditProbabilityButton, hasInputOptions } from '../utils/questionValidators'
import { useQuestionHandlers } from '../composables/useQuestionHandlers'
import { useProbabilityEditor } from '../composables/useProbabilityEditor'
import { useQuestionRandomizer } from '../composables/useQuestionRandomizer'
import { useResponsiveContainer } from '../composables/useResponsiveContainer'

const props = defineProps<{
  question: Question
}>()

const surveyStore = useSurveyStore()
const questionRef = ref<HTMLElement | null>(null)
const textareaValue = ref(props.question.textareaValue || '')

// 使用 composables
const questionHandlers = useQuestionHandlers(ref(props.question))
const probabilityEditor = useProbabilityEditor(ref(props.question))
const questionRandomizer = useQuestionRandomizer(
  ref(props.question),
  probabilityEditor.isEditingProbability,
  probabilityEditor.editedProbabilities,
  probabilityEditor.editedMatrixProbabilities,
)

// 从 composables 中解构需要的属性和方法
const {
  selectedScaleValue,
  selectedValue,
  handleOptionClick,
  handleMatrixOptionClick,
  handleSelectChange,
  handleScaleOptionClick,
  updateTextareaValue,
  updateOptionInput,
  addInput,
  removeInput,
  addTextareaInput,
  removeTextareaInput,
  fillQuickText,
} = questionHandlers

const {
  isEditingProbability,
  editedProbabilities,
  editedMatrixProbabilities,
  probabilityEditMode,
  selectedRange,
  flattenedMatrixOptions,
  startEditProbability,
  handleApplyPreset,
  handleApplyRange,
  handleUpdateProbability,
  handleMatrixApplyPreset,
  handleMatrixApplyRange,
  handleMatrixUpdateProbability,
  saveProbability,
  cancelEditProbability,
} = probabilityEditor

const { randomizeQuestion } = questionRandomizer

// 包装样式计算函数
const getProbabilityStyle = (option: any) => {
  return calculateProbabilityStyle(
    option,
    isEditingProbability.value,
    probabilityEditMode.value,
    editedProbabilities.value,
    props.question.scaleOptions,
    surveyStore.isAdvancedMode,
  )
}

const getMatrixProbabilityStyle = (row: any, option: any) => {
  return calculateMatrixProbabilityStyle(
    row,
    option,
    props.question.rows,
    isEditingProbability.value,
    probabilityEditMode.value,
    editedMatrixProbabilities.value,
    surveyStore.isAdvancedMode,
  )
}

// 使用响应式容器composable
const { containerWidth, getGridColsClass, getBreakpoint } = useResponsiveContainer(questionRef)
const getResponsiveGridClass = getGridColsClass()

// 计算属性
const hasInputOptionsComputed = computed(() => hasInputOptions(props.question))
const shouldShowRandomButtonComputed = computed(() => shouldShowRandomButton(props.question))
const shouldShowEditProbabilityButtonComputed = computed(() => shouldShowEditProbabilityButton(props.question))

let observer: MutationObserver | null = null

// 初始化选中值
// 在组件挂载时或 props 变化时调用此函数
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
