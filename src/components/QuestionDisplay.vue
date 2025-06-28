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
      <div v-if="surveyStore.isAdvancedMode" class="flex items-center space-x-2">
        <button
          @click="randomizeQuestion"
          class="rounded-md bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200"
        >
          随机本题
        </button>
        <template v-if="question.type === 'radio' || question.type === 'checkbox' || question.type === 'select'">
          <template v-if="!isEditingProbability">
            <button
              @click="startEditProbability"
              class="rounded-md bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200"
            >
              编辑概率
            </button>
          </template>
          <template v-else>
            <button
              @click="saveProbability"
              class="rounded-md bg-indigo-500 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-600"
            >
              保存
            </button>
            <button
              @click="cancelEditProbability"
              class="rounded-md bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200"
            >
              取消
            </button>
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
                  <div class="flex gap-2">
                    <p class="text-xs text-gray-500">选项概率:</p>
                    <CustomNumberInput v-model="test" class="w-16" />
                  </div>
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
            <CustomNumberInput v-model="editedProbabilities[index]" class="w-16" />
          </template>
          <template v-else>
            <span class="text-xs text-gray-700">{{ option.probability }}%</span>
          </template>
        </div>
      </div>
    </div>

    <!-- 矩阵题和矩阵多选题 -->
    <div v-else-if="question.type === 'matrix' || question.type === 'matrix-multiple'" class="overflow-x-auto">
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
            <td v-for="(option, index) in row.options" :key="index" class="cursor-pointer whitespace-nowrap px-4 py-2 text-center">
              <div class="flex items-center justify-center">
                <input
                  :type="question.type === 'matrix' ? 'radio' : 'checkbox'"
                  :name="row.title"
                  :checked="option.isSelected"
                  :class="['h-4 w-4', question.type !== 'matrix' ? 'rounded' : '']"
                  @change="handleMatrixOptionClick(row, option)"
                  :disabled="surveyStore.isAdvancedMode"
                />
              </div>
              <CustomNumberInput
                v-if="surveyStore.isAdvancedMode && (question.type === 'matrix' || (question.type === 'matrix-multiple' && option.isSelected))"
                :showArrows="false"
                v-model="option.probability"
                inputClass="text-[10px] !px-[2px] !py-1 text-center !rounded-md"
                class="mx-auto mt-1 w-10"
              />
            </td>
          </tr>
        </tbody>
      </table>
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
                <div class="flex gap-2 text-nowrap">
                  <p class="text-xs text-gray-500">选项概率:</p>
                  <CustomNumberInput v-model="test" class="w-16" />
                </div>
              </div>
            </div>
          </div>
        </template>
        <div class="mt-2 flex justify-between">
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
      </template>
      <input
        v-else
        v-model="question.textareaValue"
        type="text"
        class="w-full rounded-md border border-gray-300 p-2 hover:border-blue-500 focus:outline-[#2534DE]"
        @input="updateTextareaValue"
      />
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
              <CustomNumberInput v-model="editedProbabilities[idx]" class="w-20" inputClass="text-sm" />
            </template>
            <template v-else>
              <span class="text-xs text-gray-700">{{ option.probability }}%</span>
            </template>
          </div>
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
          @click="!surveyStore.isAdvancedMode && handleScaleOptionClick(option)"
          :class="[
            'h-8 w-8 rounded-full text-sm font-medium transition-colors duration-200 focus:outline-none',
            surveyStore.isAdvancedMode
              ? 'cursor-default bg-gray-200 text-gray-700'
              : [isOptionSelected(option) ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300', 'cursor-pointer'],
          ]"
        >
          {{ option.value }}
        </button>
      </div>
      <div v-if="surveyStore.isAdvancedMode" class="mt-4 space-y-2">
        <div v-for="option in question.scaleOptions" :key="option.value" class="flex items-center justify-between rounded-md bg-gray-50 p-2">
          <span class="text-sm text-gray-700">{{ option.value }}</span>
          <div class="flex items-center space-x-2">
            <span class="text-xs text-gray-500">概率：</span>
            <CustomNumberInput v-model="test" class="w-20" inputClass="text-sm" />
            <span class="text-xs text-gray-500">%</span>
          </div>
        </div>
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
import type { Question, MatrixRow, Option, ScaleOption } from '../types/survey'
import { useSurveyStore } from '../stores/surveyStore'
import CustomNumberInput from './CustomNumberInput.vue'
import eventBus from '../utils/eventBus'

const text = ref('')
const test = ref('')
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

const isOptionSelected = computed(() => (option: ScaleOption) => {
  return option.value <= selectedScaleValue.value
})

const isEditingProbability = ref(false)
const editedProbabilities = ref<number[]>([])

const hasInputOptions = computed(() => {
  return props.question.options?.some(option => option.hasInput) || false
})

const updateProbability = (index: number) => {
  if (!props.question.options) return

  const options = props.question.options
  let updatedOption = options[index]
  updatedOption.probability = Math.max(0, Math.min(100, Math.round(Number(updatedOption.probability))))

  let totalProbability = options.reduce((sum, option) => sum + Number(option.probability), 0)
  let diff = 100 - totalProbability

  if (diff !== 0) {
    const otherOptions = options.filter((_, i) => i !== index)
    let attempts = 0
    const maxAttempts = 100 // 防止无限循环

    while (diff !== 0 && attempts < maxAttempts) {
      for (let option of otherOptions) {
        if (diff > 0 && option.probability < 100) {
          option.probability++
          diff--
        } else if (diff < 0 && option.probability > 0) {
          option.probability--
          diff++
        }
        if (diff === 0) break
      }
      attempts++
    }

    // 如果还有剩余差值，调整更新的选项
    if (diff !== 0) {
      updatedOption.probability = Math.max(0, Math.min(100, updatedOption.probability + diff))
    }
  }

  // 确保所有概率都是非负整数
  options.forEach(option => {
    option.probability = Math.max(0, Math.round(Number(option.probability)))
  })

  // 最后检查并调整，确保总和为100
  totalProbability = options.reduce((sum, option) => sum + Number(option.probability), 0)
  if (totalProbability !== 100) {
    const lastOption = options[options.length - 1]
    lastOption.probability += 100 - totalProbability
  }

  surveyStore.updateQuestionOptions(props.question.index, options)
  surveyStore.saveData()
}

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
  } else if (props.question.selectOptions) {
    randomizeOptions(props.question.selectOptions)
    if (isEditingProbability.value) {
      editedProbabilities.value = props.question.selectOptions.map(
        o => o.probability,
      )
    }
  }

  if (props.question.options) {
    surveyStore.updateQuestionOptions(
      props.question.index,
      props.question.options || [],
    )
  } else if (props.question.selectOptions) {
    surveyStore.updateQuestionSelectOptions(
      props.question.index,
      props.question.selectOptions,
      props.question.selectedValue || '',
    )
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

const startEditProbability = () => {
  if (props.question.options) {
    editedProbabilities.value = props.question.options.map(o => o.probability)
  } else if (props.question.selectOptions) {
    editedProbabilities.value = props.question.selectOptions.map(o => o.probability)
  }
  isEditingProbability.value = true
}

const saveProbability = () => {
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
    surveyStore.updateQuestionSelectOptions(
      props.question.index,
      props.question.selectOptions,
      props.question.selectedValue || '',
    )
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
    props.question.textareaInputs = [{ value: '' }]
  } else {
    props.question.textareaInputs.push({ value: '' })
  }
  surveyStore.updateQuestionTextareaInputs(props.question.index, props.question.textareaInputs)
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
