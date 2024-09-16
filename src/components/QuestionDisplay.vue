<template>
  <div ref="questionRef" class="question bg-white rounded-lg shadow-custom p-6 mb-6 max-w-6xl mx-auto text-left">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-sm font-semibold text-gray-800">{{ question.index }}. {{ question.title }}</h3>
      <button
        v-if="surveyStore.isAutoMode"
        @click="randomizeQuestion"
        class="px-2 py-1 text-xs font-normal rounded bg-green-500 text-white"
      >
        随机本题
      </button>
    </div>
    <div v-if="question.type === 'radio' || question.type === 'checkbox'" 
         class="space-y-2 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-4 sm:space-y-0 mt-4">
      <div 
        v-for="(option, index) in question.options" 
        :key="option.value" 
        :class="[
          'p-3 rounded-md transition-all duration-200 ease-in-out',
          option.isSelected ? 'bg-blue-100 border-blue-500' : 'bg-gray-50 hover:bg-gray-100'
        ]"
      >
        <span :class="{'font-medium text-blue-700': option.isSelected, 'text-gray-700': !option.isSelected}">
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
            class="w-16 text-xs p-1 border rounded"
            @input="updateProbability(index)"
          >
          <span class="text-xs text-gray-500 ml-1">%</span>
        </div>
      </div>
    </div>
    <div v-else-if="question.type === 'matrix'" class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 text-xs">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4"></th>
            <th 
              v-for="header in question.headers" 
              :key="header"
              class="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {{ header }}
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="row in question.rows" :key="row.title">
            <td class="px-4 py-2 whitespace-nowrap font-medium text-gray-900 w-1/4">{{ row.title }}</td>
            <td 
              v-for="(option, index) in row.options" 
              :key="index" 
              :class="[
                'px-4 py-2 whitespace-nowrap text-center',
                option.isSelected ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-500'
              ]"
            >
              {{ option.value }}
              <div v-if="surveyStore.isAutoMode" class="mt-1 text-xs text-gray-400">
                {{ option.probability.toFixed(0) }}%
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else-if="question.type === 'textarea'" class="mt-4">
      <textarea
        class="w-full p-2 border border-gray-300 rounded-md"
        :value="textareaValue"
        readonly
      ></textarea>
    </div>
    <div v-else class="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
      <p class="text-yellow-700 font-medium mb-2">未知题型</p>
      <p class="text-yellow-600 text-sm">
        这是一个未识别的问题类型。我们正在努力支持更多的问题类型。
      </p>
      <details class="mt-2">
        <summary class="text-yellow-600 text-sm cursor-pointer hover:underline">
          查看原始内容
        </summary>
        <div class="mt-2 p-2 bg-white rounded border border-yellow-200 text-xs text-gray-600 overflow-auto max-h-40" v-html="question.unknownContent">
        </div>
      </details>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Question } from '../components/SurveyParser'
import { useSurveyStore } from '../stores/surveyStore'

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
      
      otherOptions.forEach((option) => {
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
  }
}

let observer: MutationObserver | null = null

const updateTextareaValue = () => {
  if (props.question.type === 'textarea' && props.question.textareaId) {
    const textarea = document.getElementById(props.question.textareaId) as HTMLTextAreaElement
    if (textarea) {
      textareaValue.value = textarea.value
    }
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

watch(() => props.question.textareaValue, (newValue) => {
  textareaValue.value = newValue || ''
})

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

defineExpose({ questionRef })
</script>

<style scoped>
.shadow-custom {
  box-shadow: 0 -1px 2px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.06), 0 2px 4px -1px rgba(0, 0, 0, 0.1);
}

@media (min-width: 640px) {
  .question {
    width: 95%;
  }
}

@media (min-width: 1024px) {
  .question {
    width: 90%;
  }
}

@media (min-width: 1280px) {
  .question {
    width: 85%;
  }
}
</style>
