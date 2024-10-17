<template>
  <div class="custom-number-input group relative overflow-hidden" @wheel="handleWheel">
    <input
      ref="inputRef"
      :value="displayValue"
      @input="handleInput"
      @blur="handleBlur"
      @keydown="handleKeyDown"
      type="text"
      inputmode="decimal"
      :placeholder="placeholder"
      :class="[
        'block h-auto w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-gray-900 transition-colors duration-200 hover:border-blue-500 focus:outline-[#2534DE]',
        inputClass,
      ]"
    />

    <div
      v-if="showArrows"
      class="absolute bottom-0 right-0 top-0 flex translate-x-full flex-col opacity-0 transition-all duration-500 ease-in-out group-focus-within:translate-x-0 group-focus-within:opacity-100 group-hover:translate-x-0 group-hover:opacity-100"
    >
      <button @click="increment" class="h-1/2 px-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
        <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path
            fill-rule="evenodd"
            d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
      <button @click="decrement" class="h-1/2 px-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
        <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path
            fill-rule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: string | number
    placeholder?: string
    min?: number
    max?: number
    step?: number
    decimalPlaces?: number
    unit?: string
    inputClass?: string
    showArrows?: boolean
  }>(),
  {
    min: 0,
    max: 100,
    step: 1,
    unit: '%',
    inputClass: '',
    showArrows: true,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const inputRef = ref<HTMLInputElement | null>(null)

const lastWheelTime = ref(0)
const wheelEvents = ref<number[]>([])
const displayValue = computed(() => {
  if (isUserInput.value) {
    return inputValue.value
  }
  const value = props.modelValue.toString()
  return value === '' ? '' : `${value}${props.unit || ''}`
})

const inputValue = ref('')
const isUserInput = ref(false)

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  let value = target.value.replace(/[^0-9.-]/g, '')
  inputValue.value = value
  isUserInput.value = true
  emit('update:modelValue', value)
}

function handleBlur() {
  if (inputRef.value) {
    let value = inputValue.value

    // 移除所有非数字和非小数点字符
    value = value.replace(/[^0-9.-]/g, '')

    // 处理负号
    const isNegative = value.startsWith('-')
    value = value.replace(/-/g, '')
    if (isNegative) {
      value = '-' + value
    }

    // 处理小数点
    const parts = value.split('.')
    let integerPart = parts[0]
    let decimalPart = parts.length > 1 ? parts[1] : ''

    // 限制小数位数
    if (props.decimalPlaces && props.decimalPlaces > 0) {
      decimalPart = decimalPart.slice(0, props.decimalPlaces)
    } else {
      decimalPart = ''
    }

    // 组合整数部分和小数部分
    value = integerPart + (decimalPart ? '.' + decimalPart : '')

    // 确保值在min和max之间
    let numValue = Number(value)
    if (props.min !== undefined && numValue < props.min) {
      numValue = props.min
    } else if (props.max !== undefined && numValue > props.max) {
      numValue = props.max
    }

    // 格式化最终值
    value = numValue.toFixed(props.decimalPlaces)

    emit('update:modelValue', value)
    isUserInput.value = false
  }
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'ArrowUp') {
    event.preventDefault()
    increment()
  } else if (event.key === 'ArrowDown') {
    event.preventDefault()
    decrement()
  }
}

function handleWheel(event: WheelEvent) {
  event.preventDefault()
  const now = Date.now()
  const timeDiff = now - lastWheelTime.value
  lastWheelTime.value = now

  wheelEvents.value.push(timeDiff)
  if (wheelEvents.value.length > 5) {
    wheelEvents.value.shift()
  }

  const averageTimeBetweenEvents = wheelEvents.value.reduce((sum, time) => sum + time, 0) / wheelEvents.value.length
  const isFastScrolling = averageTimeBetweenEvents < 50 // 阈值

  const baseStep = props.step || 1
  const adjustedStep = isFastScrolling ? baseStep * 6 : baseStep // 快速滚动时增加步进值

  if (event.deltaY < 0) {
    incrementBy(adjustedStep)
  } else {
    decrementBy(adjustedStep)
  }
}

function incrementBy(amount: number) {
  const currentValue = Number(props.modelValue) || 0
  const max = props.max !== undefined ? props.max : Infinity
  const newValue = Math.min(currentValue + amount, max)
  emit('update:modelValue', newValue.toString())
  isUserInput.value = false
}

function decrementBy(amount: number) {
  const currentValue = Number(props.modelValue) || 0
  const min = props.min !== undefined ? props.min : -Infinity
  const newValue = Math.max(currentValue - amount, min)
  emit('update:modelValue', newValue.toString())
  isUserInput.value = false
}

function increment() {
  incrementBy(props.step || 1)
}

function decrement() {
  decrementBy(props.step || 1)
}

watch(
  () => props.modelValue,
  newValue => {
    if (!isUserInput.value) {
      inputValue.value = newValue.toString()
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.custom-number-input input::-webkit-outer-spin-button,
.custom-number-input input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.custom-number-input input[type='number'] {
  -moz-appearance: textfield;
}
</style>
