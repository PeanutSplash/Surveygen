<template>
  <div ref="questionRef" class="question mx-auto mb-6 max-w-6xl rounded-lg bg-[#fefefe] p-6 text-left transition-all duration-300 ease-in-out hover:shadow-lg">
    <div class="mb-4 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <h3 class="text-sm font-medium text-gray-700">{{ question.index }}. {{ question.title }}</h3>
        <span :class="['rounded-md px-2 py-1 text-xs font-medium tracking-wide', getQuestionTypeClass(question.type)]">
          {{ getQuestionTypeLabel(question.type) }}
        </span>
      </div>
      <button
        v-if="surveyStore.isAutoMode"
        @click="randomizeQuestion"
        class="rounded-md bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200"
      >
        随机本题
      </button>
    </div>
    <div
      v-if="question.type === 'radio' || question.type === 'checkbox'"
      class="mt-4 space-y-2 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0 md:grid-cols-3 lg:grid-cols-4"
    >
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
        <div v-if="surveyStore.isAutoMode" class="mt-2">
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
    <div v-else-if="question.type === 'matrix'" class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 text-xs">
        <thead class="bg-gray-50">
          <tr>
            <th class="w-1/4 px-4 py-2 text-xs font-medium uppercase tracking-wider text-gray-500"></th>
            <th v-for="header in question.headers" :key="header" class="px-4 py-2 text-xs font-medium uppercase tracking-wider text-gray-500">
              {{ header }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-[#fefefe]">
          <tr v-for="row in question.rows" :key="row.title">
            <td class="w-1/4 whitespace-nowrap px-4 py-2 font-medium text-gray-900">{{ row.title }}</td>
            <td
              v-for="(option, index) in row.options"
              :key="index"
              :class="['cursor-pointer whitespace-nowrap px-4 py-2 text-center', option.isSelected ? 'bg-blue-100 font-medium text-blue-700' : 'text-gray-500']"
              @click="handleMatrixOptionClick(row, option)"
            >
              {{ option.value }}
              <div v-if="surveyStore.isAutoMode" class="mt-1 text-xs text-gray-400">{{ option.probability.toFixed(0) }}%</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else-if="question.type === 'textarea'" class="mt-4">
      <textarea class="w-full rounded-md border border-gray-300 p-2" v-model="textareaValue" @input="updateTextareaValue"></textarea>
    </div>
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
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Question, MatrixRow, Option } from '../components/SurveyParser'
import { useSurveyStore } from '../stores/surveyStore'
import eventBus from '../utils/eventBus'

const props = defineProps<{
  question: Question
}>()

const surveyStore = useSurveyStore()

const questionRef = ref<HTMLElement | null>(null)
const textareaValue = ref(props.question.textareaValue || '')

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
    // 单选题逻辑
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
  row.options.forEach((option: Option) => {
    option.isSelected = option === clickedOption
  })
  if (props.question.rows) {
    surveyStore.updateQuestionMatrix(props.question.index, props.question.rows)
  }
}

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
    case 'textarea':
      return '文本题'
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
    case 'textarea':
      return 'bg-yellow-50 text-yellow-600 border border-yellow-200'
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
