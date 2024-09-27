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
        <div class="drag-handle flex cursor-move select-none items-center justify-between bg-gray-100 px-4 py-2 text-lg font-semibold">
          <div class="flex items-center">
            <span class="text-base font-semibold text-gray-800">Surveygen</span>
            <span class="ml-2 text-xs font-normal text-gray-500">v {{ version }}</span>
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
      <transition name="fade">
        <div v-if="isVerifying" class="mt-1 overflow-hidden rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 p-0.5 shadow-lg">
          <div class="flex items-center space-x-3 rounded-lg bg-gray-900 bg-opacity-90 px-4 py-3 text-white">
            <div class="relative h-6 w-6">
              <div class="absolute inset-0 h-full w-full animate-spin rounded-full border-b-2 border-white"></div>
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="h-2 w-2 rounded-full bg-white"></div>
              </div>
            </div>
            <span class="text-sm font-medium">{{ verificationStatus }}</span>
          </div>
        </div>
      </transition>
    </vue-draggable-resizable>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import 'vue-draggable-resizable/style.css'
import QuestionDisplay from './QuestionDisplay.vue'
import { useSurveyStore } from '../stores/surveyStore'
import { useSurveyObserver } from '../composables/useSurveyObserver'
import { simulateHumanClick, simulateSliderVerification } from '../utils/humanSimulation'

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

const isVerifying = ref(false)
const verificationStatus = ref('')

// 修改 handleVerification 函数
const handleVerification = async () => {
  const verifyButton = document.querySelector('#SM_BTN_1') as HTMLElement
  if (verifyButton) {
    isVerifying.value = true
    verificationStatus.value = '正在绕过人机验证...'
    await simulateHumanClick(verifyButton)

    // 等待验证结果
    return new Promise<void>(resolve => {
      const observer = new MutationObserver(async mutations => {
        for (const mutation of mutations) {
          if (mutation.type === 'childList') {
            const addedNodes = mutation.addedNodes
            for (let i = 0; i < addedNodes.length; i++) {
              const node = addedNodes[i] as HTMLElement
              if (node.id === 'SM_POP_1') {
                // 滑块验证出现
                verificationStatus.value = '正在绕过滑块验证...'
                observer.disconnect()
                await simulateSliderVerification()
                isVerifying.value = false
                resolve()
                return
              }
            }
          } else if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            const target = mutation.target as HTMLElement
            if (target.classList.contains('sm-btn-success')) {
              verificationStatus.value = '验证成功'
              observer.disconnect()
              isVerifying.value = false
              resolve()
              return
            }
          }
        }
      })

      observer.observe(document.body, {
        attributes: true,
        childList: true,
        subtree: true,
      })

      // 设置超时，以防验证无法完成
      setTimeout(() => {
        observer.disconnect()
        isVerifying.value = false
        verificationStatus.value = '验证超时'
        resolve()
      }, 15000) // 保持15秒的超时时间
    })
  }
}

// 修改 fillSurveyAnswers 函数
const fillSurveyAnswers = async () => {
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

  // 滚动到页面底部
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })

  // 添加定时器，等待一秒钟后点击提交按钮
  await new Promise(resolve => setTimeout(resolve, 1000))

  const submitButton = document.getElementById('submit_button') as HTMLInputElement
  if (submitButton) {
    localStorage.setItem('currentSurveyUrl', window.location.href)
    await simulateHumanClick(submitButton)

    // 处理可能出现的验证
    await handleVerification()

    // 再次点击提交按钮（如果验证后需要）
    await simulateHumanClick(submitButton)
  }
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

const clearCookie = () => {
  const keys = document.cookie.match(/[^ =;]+(?=\=)/g)
  if (keys) {
    for (let i = keys.length; i--; ) {
      document.cookie = `${keys[i]}=0;path=/;expires=${new Date(0).toUTCString()}` // 清除当前域名下的
      document.cookie = `${keys[i]}=0;path=/;domain=${document.domain};expires=${new Date(0).toUTCString()}` // 清除当前域名下的
      document.cookie = `${keys[i]}=0;path=/;domain=${document.domain.split('.').slice(-2).join('.')};expires=${new Date(0).toUTCString()}` // 清除一级域名下的
    }
  }
}

onMounted(() => {
  // 清除 cookie
  clearCookie()

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

.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.bg-gradient-to-r {
  background-size: 200% 200%;
  animation: gradient 3s ease infinite;
}
</style>
