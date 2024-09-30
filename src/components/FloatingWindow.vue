<template>
  <div v-if="surveyStore.isVisible" class="pointer-events-none !fixed !inset-0 !z-[9999]">
    <vue-draggable-resizable
      :w="600"
      :h="400"
      :x="20"
      :y="20"
      :parent="false"
      :draggable="true"
      :resizable="true"
      :drag-handle="'.drag-handle'"
      class="!pointer-events-auto rounded-lg shadow-lg"
    >
      <div class="flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-[#fafafa]">
        <div
          class="drag-handle flex cursor-move select-none items-center justify-between bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-2 text-white shadow-sm"
        >
          <div class="flex items-center space-x-2">
            <IconLogo class="h-4 w-4" />
            <span class="text-sm font-medium">Surveygen</span>
            <span class="rounded-full bg-white bg-opacity-20 px-1.5 py-0.5 text-xs">v{{ version }}</span>
          </div>
          <div class="flex items-center space-x-2">
            <button @click="toggleSettings" class="rounded-full bg-white bg-opacity-20 p-1 text-white transition-colors duration-200 hover:bg-opacity-30">
              <CogIcon class="h-5 w-5" />
            </button>
            <span class="text-xs opacity-75">已提交: {{ surveyStore.submissionCount }} 次</span>
          </div>
        </div>
        <div ref="scrollContainer" class="flex-1 overflow-auto p-4" @wheel="handleScroll">
          <div v-if="surveyStore.questions.length === 0" class="flex h-full flex-col items-center justify-center">
            <div class="h-16 w-16 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            <p class="mt-4 text-lg font-semibold text-gray-700">正在等待问卷加载...</p>
            <p class="mt-2 text-sm text-gray-500">请稍候，我们正在为您准备问卷内容</p>
          </div>
          <QuestionDisplay
            v-else
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
        <div v-if="isVerifying" class="relative mt-1 overflow-hidden rounded-lg p-0.5 shadow-lg">
          <div class="animate-border-flow absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-600 to-blue-500"></div>
          <div class="relative z-10 flex items-center space-x-3 rounded-md bg-gray-900 bg-opacity-90 px-4 py-3 text-white">
            <ArrowPathRoundedSquareIcon class="h-6 w-6 animate-spin text-white" />
            <span class="text-sm font-medium">{{ verificationStatus }}</span>
          </div>
        </div>
      </transition>
      <transition name="fade">
        <SettingsPanel
          v-if="isSettingsVisible"
          :is-auto-mode="surveyStore.isAutoMode"
          :is-auto-answer-enabled="isAutoAnswerEnabled"
          @close="toggleSettings"
          @toggle-mode="surveyStore.toggleMode"
          @toggle-auto-answer="toggleAutoAnswer"
          @randomize-all="randomizeAllQuestions"
          @reset-survey="resetSurvey"
        />
      </transition>
    </vue-draggable-resizable>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import 'vue-draggable-resizable/style.css'
import QuestionDisplay from './QuestionDisplay.vue'
import { useSurveyStore } from '../stores/surveyStore'
import { useSurveyObserver } from '../composables/useSurveyObserver'
import { simulateHumanClick, simulateSliderVerification } from '../utils/humanSimulation'
import IconLogo from '../assets/logo.svg'
import { ArrowPathRoundedSquareIcon, CogIcon } from '@heroicons/vue/24/solid'
import eventBus from '../utils/eventBus'
import SettingsPanel from './SettingsPanel.vue'

const surveyStore = useSurveyStore()
const questionRefs = ref<{ [key: number]: any }>({})
const scrollContainer = ref<HTMLElement | null>(null)
const isRedirecting = ref(false)

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
  if (surveyStore.hasUnansweredQuestions()) {
    eventBus.emit('showToast', { message: '请先完成所有问题的回答', type: 'warning' })
    return
  }

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

  return new Promise<void>(resolve => {
    // 待页面跳转或其他完成标志
    const checkCompletion = setInterval(() => {
      if (document.location.href.includes('complete.aspx')) {
        clearInterval(checkCompletion)
        resolve()
      }
    }, 500)

    // 设置超时
    setTimeout(() => {
      clearInterval(checkCompletion)
      resolve()
    }, 10000)
  })
}

const observer = new MutationObserver(() => {
  const currentUrl = window.location.href
  if (currentUrl.includes('https://www.wjx.cn/wjx/join/complete.aspx') && !isRedirecting.value) {
    isRedirecting.value = true
    setTimeout(() => {
      const savedUrl = localStorage.getItem('currentSurveyUrl')
      if (savedUrl) {
        surveyStore.incrementSubmissionCount()
        window.location.href = savedUrl
      }
      isRedirecting.value = false
    }, 1000)
  }
})

// 配置观察器
const config = { subtree: true, childList: true }

// 开始观察
observer.observe(document.body, config)

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

function handleAlertBox() {
  const alertBox = document.getElementById('alert_box')
  if (alertBox) {
    const confirmButton = alertBox.querySelector('button') as HTMLButtonElement
    if (confirmButton) {
      confirmButton.click()
    }
  }
}

const isAutoAnswerEnabled = ref(false)

const toggleAutoAnswer = async () => {
  if (surveyStore.hasUnansweredQuestions()) {
    eventBus.emit('showToast', { message: '请先完成所有问题的回答', type: 'warning' })
    return
  }

  isAutoAnswerEnabled.value = !isAutoAnswerEnabled.value
  localStorage.setItem('autoAnswerEnabled', JSON.stringify(isAutoAnswerEnabled.value))

  if (isAutoAnswerEnabled.value) {
    await fillSurveyAnswers()
  }
}

const isSettingsVisible = ref(false)

const toggleSettings = () => {
  isSettingsVisible.value = !isSettingsVisible.value
}

// 修改 resetSurvey 函数
const resetSurvey = () => {
  surveyStore.resetSurvey()
  
  // 显示提示信息
  eventBus.emit('showToast', { message: '问卷数据已重置', type: 'success' })
  
  // 关闭设置面板
  isSettingsVisible.value = false
}

onMounted(() => {
  // 解除禁用右键菜单和文本选择
  document.oncontextmenu = document.onselectstart = null

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

  // 从本地存储读取自动答题状态
  const storedAutoAnswerEnabled = localStorage.getItem('autoAnswerEnabled')
  if (storedAutoAnswerEnabled !== null) {
    isAutoAnswerEnabled.value = JSON.parse(storedAutoAnswerEnabled)
  }

  // 如果自动答题已启用，则触发填充答案
  if (isAutoAnswerEnabled.value) {
    fillSurveyAnswers()
  }

  const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        const addedNodes = mutation.addedNodes
        for (let i = 0; i < addedNodes.length; i++) {
          const node = addedNodes[i] as HTMLElement
          if (node.id === 'alert_box') {
            handleAlertBox()
            break
          }
        }
      }
    }
  })

  const config = { childList: true, subtree: true }

  observer.observe(document.body, config)

  onUnmounted(() => {
    observer.disconnect()
  })

  // 加载提交次数
  surveyStore.loadSubmissionCount()
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
  background-size: 150% 150%;
  animation: gradient 10s ease infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes border-flow {
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

.animate-border-flow {
  background-size: 200% 200%;
  animation: border-flow 3s linear infinite;
}
</style>