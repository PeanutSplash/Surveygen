<template>
  <div v-if="surveyStore.isVisible" class="!pointer-events-none !fixed !inset-0 !z-50">
    <vue-draggable-resizable
      :w="600"
      :h="400"
      :x="20"
      :y="20"
      :parent="false"
      :draggable="true"
      :resizable="true"
      :drag-handle="'.drag-handle'"
      class="custom-resizable pointer-events-auto rounded-lg shadow-lg"
    >
      <div class="flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div class="drag-handle flex cursor-move select-none items-center justify-between bg-gray-100 p-2 text-lg font-semibold">
          <div class="flex items-center">
            <span class="text-base font-semibold text-gray-800">问卷星自动答题小助手</span>
            <span class="ml-2 text-xs font-normal text-gray-500">v{{ version }}</span>
          </div>
          <div class="flex items-center">
            <button
              @click="surveyStore.toggleMode"
              class="mr-2 rounded px-2 py-1 text-xs font-normal"
              :class="surveyStore.isAutoMode ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'"
            >
              {{ surveyStore.isAutoMode ? '自动模式' : '手动模式' }}
            </button>
            <button v-if="surveyStore.isAutoMode" @click="randomizeAllQuestions" class="mr-2 rounded bg-green-500 px-2 py-1 text-xs font-normal text-white">
              随机所有题目
            </button>
            <span class="text-xs font-normal text-gray-500">F3 显示/隐藏</span>
          </div>
        </div>
        <div ref="scrollContainer" class="flex-1 overflow-auto p-4" @wheel="handleScroll">
          <div v-if="surveyStore.questions.length === 0">正在解析问卷...</div>
          <QuestionDisplay
            v-for="question in surveyStore.questions"
            :key="question.index"
            :question="question"
            :ref="
              el => {
                if (el) questionRefs[question.index] = el
              }
            "
          />
        </div>
      </div>
    </vue-draggable-resizable>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import 'vue-draggable-resizable/style.css'
import QuestionDisplay from './QuestionDisplay.vue'
import { useSurveyStore } from '../stores/surveyStore'
import { useSurveyObserver } from '../composables/useSurveyObserver'

const surveyStore = useSurveyStore()
const questionRefs = ref<{ [key: number]: any }>({})
const scrollContainer = ref<HTMLElement | null>(null)

// 获取版本号
const version = import.meta.env.VITE_APP_VERSION || '未知'

const handleScroll = (event: WheelEvent) => {
  event.stopPropagation()
}

const scrollToQuestion = (index: number) => {
  nextTick(() => {
    const questionElement = questionRefs.value[index]?.questionRef
    if (questionElement && scrollContainer.value) {
      questionElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
      })
    }
  })
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'F3') {
    surveyStore.toggleVisibility()
  }
}

const redirectToVjUrl = () => {
  const currentUrl = window.location.href
  if (currentUrl.includes('/vm/')) {
    const newUrl = currentUrl.replace('/vm/', '/vj/')
    window.location.href = newUrl
  }
}

type Option = {
  probability: number
  [key: string]: any
}

type Row = {
  options: Option[]
  [key: string]: any
}

type Question = {
  options?: Option[]
  rows?: Row[]
  [key: string]: any
}

const randomizeAllQuestions = (): void => {
  surveyStore.questions.forEach((question: Question) => {
    if (question.options) {
      randomizeOptions(question.options)
    } else if (question.rows) {
      question.rows.forEach(row => randomizeOptions(row.options))
    }
  })
}

const randomizeOptions = (options: Option[]): void => {
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

// 新增函数：填充问卷答案
const fillSurveyAnswers = () => {
  const surveyContent = document.getElementById('ctl00_ContentPlaceHolder1_JQ1_surveyContent')
  if (!surveyContent) return

  surveyStore.questions.forEach((question, index) => {
    const questionElement = surveyContent.querySelector(`#divquestion${index + 1}`)
    if (!questionElement) return

    if (question.options) {
      const totalProbability = question.options.reduce((sum, option) => sum + option.probability, 0)
      let random = Math.random() * totalProbability
      let selectedOption = null

      for (const option of question.options) {
        if (random < option.probability) {
          selectedOption = option
          break
        }
        random -= option.probability
      }

      if (selectedOption) {
        const inputElement = questionElement.querySelector(`input[value="${selectedOption.value}"]`) as HTMLInputElement
        if (inputElement) {
          inputElement.checked = true
          const labelElement = inputElement.nextElementSibling as HTMLElement
          if (labelElement) {
            labelElement.click() // 模拟点击以触发样式变化
          }
        }
      }
    } else if (question.rows) {
      question.rows.forEach(row => {
        const totalProbability = row.options.reduce((sum, option) => sum + option.probability, 0)
        let random = Math.random() * totalProbability
        let selectedOption = null

        for (const option of row.options) {
          if (random < option.probability) {
            selectedOption = option
            break
          }
          random -= option.probability
        }

        if (selectedOption) {
          const inputElement = questionElement.querySelector(`input[value="${selectedOption.value}"]`) as HTMLInputElement
          if (inputElement) {
            inputElement.checked = true
            const labelElement = inputElement.nextElementSibling as HTMLElement
            if (labelElement) {
              labelElement.click() // 模拟点击以触发样式变化
            }
          }
        }
      })
    } else if (question.type === 'textarea' && question.textareaId) {
      const textareaElement = document.getElementById(question.textareaId) as HTMLTextAreaElement
      if (textareaElement) {
        textareaElement.value = question.textareaValue || ''
      }
    }
  })
  // 添加定时器，等待一秒钟后点击提交按钮
  setTimeout(() => {
    const submitButton = document.getElementById('submit_button') as HTMLInputElement
    if (submitButton) {
      localStorage.setItem('currentSurveyUrl', window.location.href)
      submitButton.click()
    }
  }, 1000)
}

const observer = new MutationObserver(() => {
  const currentUrl = window.location.href
  if (currentUrl.includes('https://www.wjx.cn/wjx/join/complete.aspx')) {
    setTimeout(() => {
      const savedUrl = localStorage.getItem('currentSurveyUrl')
      if (savedUrl) {
        window.location.href = savedUrl
      }
    }, 1000)
  }
})

// 配置观察器
const config = { subtree: true, childList: true }

// 开始观察
observer.observe(document, config)

// 在组件卸载时停止观察
onUnmounted(() => {
  observer.disconnect()
})

onMounted(() => {
  const dragHandle = document.querySelector('.drag-handle') as HTMLElement
  if (dragHandle) {
    dragHandle.style.touchAction = 'none'
  }

  window.addEventListener('keydown', handleKeyDown)

  // 检查并自动重定向到VJ版本
  redirectToVjUrl()

  // 加载保存的数据
  surveyStore.loadData()

  // 使用 useSurveyObserver composable
  useSurveyObserver(surveyStore, scrollToQuestion)

  // 填充问卷答案
  fillSurveyAnswers()
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<style>
@import 'vue-draggable-resizable/style.css';

.handle {
  border: none !important;
  background: transparent !important;
}
.vdr {
  border: none !important;
}
.custom-resizable {
  z-index: 9999 !important;
}
</style>
