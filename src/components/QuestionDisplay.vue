<template>
  <div ref="questionRef" class="question mx-auto mb-6 max-w-6xl rounded-lg bg-[#fefefe] p-6 text-left transition-all duration-300 ease-in-out hover:shadow-lg">
    <!-- 问题标题和类型 -->
    <div class="mb-4 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <h3 class="text-sm font-medium text-gray-700">{{ question.index }}. {{ question.title }}</h3>
        <span :class="['rounded-md px-2 py-1 text-xs font-medium tracking-wide', getQuestionTypeClass(question.type)]">
          {{ getQuestionTypeLabel(question.type) }}
        </span>
      </div>
      <button
        v-if="surveyStore.isAdvancedMode"
        @click="randomizeQuestion"
        class="rounded-md bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200"
      >
        随机本题
      </button>
    </div>

    <!-- 单选题和多选题 -->
    <div
      v-if="question.type === 'radio' || question.type === 'checkbox'"
      class="mt-4 space-y-2 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0 md:grid-cols-3 lg:grid-cols-4"
    >
      <!-- 选项 -->
      <div
        v-for="(option, index) in question.options"
        :key="option.value"
        :class="[
          'cursor-pointer rounded-lg p-3 transition-all duration-200 ease-in-out',
          option.isSelected
            ? 'border-2 border-indigo-300 bg-indigo-50 shadow-sm'
            : 'border border-gray-200 bg-[#fefefe] hover:border-indigo-200 hover:bg-indigo-50 hover:shadow-sm',
        ]"
        @click="handleOptionClick(option.text)"
      >
        <span :class="{ 'font-medium text-indigo-700': option.isSelected, 'text-gray-700': !option.isSelected }">
          {{ option.text }}
        </span>
        <!-- 高级模式：概率设置 -->
        <div v-if="surveyStore.isAdvancedMode" class="mt-2">
          <label class="text-xs text-gray-500">概率：</label>
          <input
            type="number"
            v-model.number="option.probability"
            min="0"
            max="100"
            step="1"
            class="w-16 rounded border p-1 text-xs focus:border-indigo-300 focus:outline-none focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            @input="updateProbability(index)"
          />
          <span class="ml-1 text-xs text-gray-500">%</span>
        </div>
      </div>
    </div>

    <!-- 矩阵题和矩阵多选题 -->
    <div v-else-if="question.type === 'matrix' || question.type === 'matrix-multiple'" class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 text-xs">
        <!-- 表头 -->
        <thead class="bg-gray-50">
          <tr>
            <th class="w-1/4 px-4 py-2 text-xs font-medium uppercase tracking-wider text-gray-500"></th>
            <th v-for="header in question.headers" :key="header" class="px-4 py-2 text-xs font-medium uppercase tracking-wider text-gray-500">
              {{ header }}
            </th>
          </tr>
        </thead>
        <!-- 表体 -->
        <tbody class="divide-y divide-gray-200 bg-[#fefefe]">
          <tr v-for="row in question.rows" :key="row.title">
            <td class="w-1/4 whitespace-nowrap px-4 py-2 font-medium text-gray-900">{{ row.title }}</td>
            <td
              v-for="(option, index) in row.options"
              :key="index"
              class="cursor-pointer whitespace-nowrap px-4 py-2 text-center"
              @click="handleMatrixOptionClick(row, option)"
            >
              <div class="flex items-center justify-center">
                <input
                  :type="question.type === 'matrix' ? 'radio' : 'checkbox'"
                  :name="row.title"
                  :checked="option.isSelected"
                  :class="['h-4 w-4', question.type !== 'matrix' ? 'rounded' : '']"
                  @click.stop
                />
              </div>
              <div v-if="surveyStore.isAdvancedMode" class="mt-1 text-xs text-gray-400">{{ option.probability.toFixed(0) }}%</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 文本题 -->
    <div v-else-if="question.type === 'textarea'" class="mt-4">
      <textarea class="w-full rounded-md border border-gray-300 p-2" v-model="textareaValue" @input="updateTextareaValue"></textarea>
    </div>

    <!-- 下拉选择题 -->
    <div v-else-if="question.type === 'select'" class="mt-4">
      <select v-model="selectedValue" class="w-full rounded-md border border-gray-300 p-2">
        <option v-for="option in question.selectOptions" :key="option.value" :value="option.value">
          {{ option.text }}
        </option>
      </select>
      <!-- 高级模式：概率设置 -->
      <div v-if="surveyStore.isAdvancedMode" class="mt-2">
        <div v-for="option in question.selectOptions" :key="option.value" class="flex items-center space-x-2">
          <span>{{ option.text }}:</span>
          <input
            type="number"
            v-model.number="option.probability"
            min="0"
            max="100"
            step="1"
            class="w-16 rounded border p-1 text-xs"
            @input="updateSelectProbability(option)"
          />
          <span class="text-xs text-gray-500">%</span>
        </div>
      </div>
    </div>

    <!-- 量表题 -->
    <div v-else-if="question.type === 'scale'" class="mt-4">
      <div class="mb-2 flex items-center justify-between">
        <span class="text-sm text-gray-600">{{ question.minLabel }}</span>
        <span class="text-sm text-gray-600">{{ question.maxLabel }}</span>
      </div>
      <div class="flex justify-between">
        <button
          v-for="option in question.scaleOptions"
          :key="option.value"
          @click="handleScaleOptionClick(option)"
          :class="[
            'h-8 w-8 rounded-full text-sm font-medium transition-colors duration-200 focus:outline-none',
            isOptionSelected(option) ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
          ]"
        >
          {{ option.value }}
        </button>
      </div>
    </div>

    <!-- 未知题型 -->
    <div v-else class="mt-4 rounded-md border border-yellow-200 bg-yellow-50 p-4">
      <p class="mb-2 font-medium text-yellow-700">未知题型</p>
      <p class="text-sm text-yellow-600">这是一个未识别的问题类型。我们正在努力支持更多的问题类型。</p>
      <details class="mt-2">
        <summary class="cursor-pointer text-sm text-yellow-600 hover:underline">查看原始内容</summary>
        <div class="mt-2 max-h-40 overflow-auto rounded border border-yellow-200 bg-[#fefefe] p-2 text-xs text-gray-600" v-html="question.unknownContent"></div>
      </details>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { Question, MatrixRow, Option, ScaleOption } from '../types/survey'
import { useSurveyStore } from '../stores/surveyStore'
import eventBus from '../utils/eventBus'

const props = defineProps<{
  question: Question
}>()

const surveyStore = useSurveyStore()

const questionRef = ref<HTMLElement | null>(null)
const textareaValue = ref(props.question.textareaValue || '')

// 添加这个计算属性
const selectedValue = computed({
  get: () => props.question.selectedValue || '',
  set: value => {
    handleSelectChange(value)
  },
})

// 添加一个响应式引用来跟踪当前选中的值
const selectedScaleValue = ref(0)

// 使用计算属性来确定每个选项是否应该被选中
const isOptionSelected = computed(() => (option: ScaleOption) => {
  return option.value <= selectedScaleValue.value
})

const updateProbability = (index: number) => {
  if (props.question.options) {
    let probability = Number(props.question.options[index].probability)

    // 如果输入不是有效的数字，将其设置为0
    if (isNaN(probability)) {
      probability = 0
    }

    // 确保概率在0到100之间
    probability = Math.max(0, Math.min(100, probability))

    props.question.options[index].probability = probability

    let totalProbability = props.question.options.reduce((sum, option) => sum + Number(option.probability), 0)

    // 如果总和超过100，按比例减少其他选项的概率
    if (totalProbability > 100) {
      const excess = totalProbability - 100
      const otherOptions = props.question.options.filter((_, i) => i !== index)
      const otherTotalProbability = otherOptions.reduce((sum, option) => sum + Number(option.probability), 0)

      otherOptions.forEach(option => {
        if (otherTotalProbability > 0) {
          const reduction = Math.round((Number(option.probability) / otherTotalProbability) * excess)
          option.probability = Math.max(0, Number(option.probability) - reduction)
        }
      })
    }

    // 确保所有概率都是非负整数
    props.question.options.forEach(option => {
      option.probability = Math.max(0, Math.round(Number(option.probability)))
    })

    surveyStore.updateQuestionOptions(props.question.index, props.question.options)
    surveyStore.saveData() // 添加这行来保存更新后的数据
  }
}

let observer: MutationObserver | null = null

const updateTextareaValue = () => {
  surveyStore.updateQuestionTextarea(props.question.index, textareaValue.value)
}

const handleOptionClick = (optionText: string) => {
  if (props.question.type === 'radio') {
    // 单选逻辑
    props.question.options?.forEach(option => {
      option.isSelected = option.text === optionText
    })
  } else if (props.question.type === 'checkbox') {
    // 多选题逻辑
    const option = props.question.options?.find(o => o.text === optionText)
    if (option) {
      option.isSelected = !option.isSelected
    }
  }

  // 更新问题选项
  surveyStore.updateQuestionOptions(props.question.index, props.question.options || [])
}

const handleMatrixOptionClick = (row: MatrixRow, clickedOption: Option) => {
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

const updateSelectProbability = (updatedOption: Option) => {
  if (props.question.selectOptions) {
    let totalProbability = props.question.selectOptions.reduce(
      (sum, option) => sum + (option === updatedOption ? updatedOption.probability : option.probability),
      0,
    )

    if (totalProbability > 100) {
      const excess = totalProbability - 100
      props.question.selectOptions.forEach(option => {
        if (option !== updatedOption) {
          option.probability = Math.max(0, option.probability - excess / (props.question.selectOptions!.length - 1))
        }
      })
    }

    surveyStore.updateQuestion(props.question.index, props.question)
  }
}

const handleScaleOptionClick = (clickedOption: ScaleOption) => {
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
      observer = new MutationObserver(updateTextareaValue)
      observer.observe(textarea, { attributes: true, childList: true, characterData: true, subtree: true })

      // 添加输入事件监听器
      textarea.addEventListener('input', updateTextareaValue)
    }
  }
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
  if (props.question.type === 'textarea' && props.question.textareaId) {
    const textarea = document.getElementById(props.question.textareaId)
    if (textarea) {
      textarea.removeEventListener('input', updateTextareaValue)
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
  } else if (props.question.rows) {
    props.question.rows.forEach(row => randomizeOptions(row.options))
  }
  surveyStore.updateQuestionOptions(props.question.index, props.question.options || [])
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
