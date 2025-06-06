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
        <FloatingWindowHeader
          :version="version"
          :submission-count="surveyStore.submissionCount"
          @toggle-settings="toggleSettings"
          @stop-auto-answer="stopAutoAnswer"
          @manual-submit="handleManualSubmit"
        />
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
          :is-advanced-mode="surveyStore.isAdvancedMode"
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
import FloatingWindowHeader from './FloatingWindowHeader.vue'
import { useSurveyStore } from '../stores/surveyStore'
import { useSurveyObserver } from '../composables/useSurveyObserver'
import { simulateHumanClick, simulateSliderVerification } from '../utils/humanSimulation'
import { ArrowPathRoundedSquareIcon } from '@heroicons/vue/24/solid'
import eventBus from '../utils/eventBus'
import SettingsPanel from './SettingsPanel.vue'
import { Question, ScaleOption } from '../types/survey'

const surveyStore = useSurveyStore()
const questionRefs = ref<{ [key: number]: any }>({})
const scrollContainer = ref<HTMLElement | null>(null)
const isRedirecting = ref(false)

// 获取版本号
const version = import.meta.env.VITE_APP_VERSION || '未知'

const handleUnansweredQuestionFlow = (unansweredQuestions: number[]): boolean => {
  if (unansweredQuestions.length > 0) {
    const firstUnansweredIndex = unansweredQuestions[0]
    scrollToQuestion(firstUnansweredIndex)

    const questionComponent = questionRefs.value[firstUnansweredIndex]
    if (questionComponent && questionComponent.questionRef) {
      const questionElement = questionComponent.questionRef as HTMLElement
      questionElement.classList.add('flash-warning')
      setTimeout(() => {
        questionElement.classList.remove('flash-warning')
      }, 1500) // 闪烁1.5秒
    }
    return true // 表示有未回答的问题
  }
  return false // 表示没有未回答的问题
}

const handleScroll = (event: WheelEvent) => {
  const container = scrollContainer.value
  if (!container) return

  const { scrollTop, scrollHeight, clientHeight } = container
  const isAtTop = scrollTop === 0
  const isAtBottom = scrollTop + clientHeight >= scrollHeight

  // 检查事件目标是否为输入框
  const isInputElement = event.target instanceof HTMLInputElement && event.target.type === 'number'

  // 如果不是输入框，并且在顶部或底部继续滚动，则阻止事件传播
  if (!isInputElement && ((isAtTop && event.deltaY < 0) || (isAtBottom && event.deltaY > 0))) {
    event.preventDefault()
    event.stopPropagation()
  } else {
    // 对于其他情况，只阻止事件传播，不阻止默认行为
    event.stopPropagation()
  }
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
const handleVerification = async (): Promise<boolean> => {
  const verifyButton = document.querySelector('#SM_BTN_1') as HTMLElement
  if (verifyButton) {
    isVerifying.value = true
    verificationStatus.value = '正在绕过人机验证...'
    await simulateHumanClick(verifyButton)

    return new Promise<boolean>(resolve => {
      const observer = new MutationObserver(async mutations => {
        for (const mutation of mutations) {
          if (mutation.type === 'childList') {
            const addedNodes = mutation.addedNodes
            for (let i = 0; i < addedNodes.length; i++) {
              const node = addedNodes[i] as HTMLElement
              if (node.id === 'SM_POP_1') {
                verificationStatus.value = '正在绕过滑块验证...'
                observer.disconnect()
                await simulateSliderVerification()
                isVerifying.value = false
                resolve(true)
                return
              }
            }
          } else if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            const target = mutation.target as HTMLElement
            if (target.classList.contains('sm-btn-success')) {
              verificationStatus.value = '验证成功'
              observer.disconnect()
              isVerifying.value = false
              resolve(true)
              return
            } else if (target.classList.contains('sm-btn-fail')) {
              verificationStatus.value = '验证失败'
              observer.disconnect()
              isVerifying.value = false
              resolve(false)
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

      setTimeout(() => {
        observer.disconnect()
        isVerifying.value = false
        if (verificationStatus.value !== '验证成功') {
          verificationStatus.value = '验证超时'
          resolve(false)
        } else {
          resolve(true)
        }
      }, 15000)
    })
  }
  return true
}

// 修改 fillSurveyAnswers 函数
const fillSurveyAnswers = async (): Promise<boolean> => {
  const { hasUnanswered, unansweredQuestions } = surveyStore.hasUnansweredQuestions()
  if (hasUnanswered) {
    handleUnansweredQuestionFlow(unansweredQuestions)
    eventBus.emit('showToast', { message: `请先完成所有问题的回答, 未完成的题目: ${unansweredQuestions.join(', ')}`, type: 'warning' })
    return false
  }

  const surveyContent = document.getElementById('ctl00_ContentPlaceHolder1_JQ1_surveyContent')
  if (!surveyContent) {
    eventBus.emit('showToast', { message: '未找到问卷内容区域', type: 'error' })
    return false
  }

  for (const question of surveyStore.questions) {
    const questionElement = surveyContent.querySelector(`#divquestion${question.index}`)
    if (!questionElement) continue

    if (question.options) {
      // 处理单选题和多选题
      handleOptionsQuestion(questionElement, question)
    } else if (question.rows) {
      // 处理矩阵题
      handleMatrixQuestion(questionElement, question)
    } else if (question.type === 'textarea' && question.textareaId) {
      // 处理文本题
      handleTextareaQuestion(question)
    } else if (question.type === 'select') {
      // 处理下拉框题
      handleSelectQuestion(questionElement, question)
    } else if (question.type === 'scale') {
      // 处理量表题
      handleScaleQuestion(questionElement, question)
    }
  }

  // 滚动到页面底部
  window.scrollTo(0, document.body.scrollHeight)

  // 添加定时器，等待一秒钟后点击提交按钮
  await new Promise(resolve => setTimeout(resolve, 1000))

  const submitButton = document.getElementById('submit_button') as HTMLInputElement
  if (submitButton) {
    localStorage.setItem('currentSurveyUrl', window.location.href)
    await simulateHumanClick(submitButton)

    // 处理可能出现的验证
    const verificationSuccess = await handleVerification()
    if (!verificationSuccess) {
      eventBus.emit('showToast', { message: '人机验证失败或超时', type: 'error' })
      return false
    }

    // 再次点击提交按钮（如果验证后需要）
    // 某些情况下，验证成功后会自动提交，或者需要再次点击
    // 这里可以根据实际情况判断是否需要再次点击
    // 为了简化，我们先假设验证成功后可能需要再次点击
    // 如果验证成功后页面已跳转或提交已完成，这里的点击可能无效或报错，需要健壮性处理
    // 例如检查页面状态或按钮是否存在

    // 尝试再次点击提交，但这取决于具体的问卷系统行为
    // 如果验证后自动提交，则不需要这步
    // const submitButtonAfterVerification = document.getElementById('submit_button') as HTMLInputElement
    // if (submitButtonAfterVerification) {
    //   await simulateHumanClick(submitButtonAfterVerification)
    // } else {
    // 可能验证成功后按钮消失了，或者页面跳转了
    // }
  } else {
    eventBus.emit('showToast', { message: '未找到提交按钮', type: 'error' })
    return false
  }

  return new Promise<boolean>(resolve => {
    // 待页面跳转或其他完成标志
    const checkCompletion = setInterval(() => {
      if (document.location.href.includes('complete.aspx')) {
        clearInterval(checkCompletion)
        resolve(true)
      }
    }, 500)

    // 设置超时
    setTimeout(() => {
      clearInterval(checkCompletion)
      // 如果超时了，检查当前URL是否已经是完成页，因为上面的setInterval可能还没来得及检测到
      if (document.location.href.includes('complete.aspx')) {
        resolve(true)
      } else {
        eventBus.emit('showToast', { message: '提交超时，未跳转到完成页面', type: 'warning' })
        resolve(false)
      }
    }, 10000)
  })
}

// 处理单选题和多选题
const handleOptionsQuestion = (questionElement: Element, question: Question) => {
  question.options?.forEach(option => {
    if (!option.isSelected) return

    const li = questionElement.querySelector(`li:has(input[value="${option.value}"])`) as HTMLLIElement
    if (!li) return

    const a = li.querySelector('a.jqCheckbox, a.jqRadio') as HTMLAnchorElement
    a?.click()

    if (option.hasInput && option.inputs && option.inputs.length > 0) {
      console.log(JSON.parse(JSON.stringify(option)))
      const inputValue = option.inputs[0].value
      const input = li.querySelector('input.underline') as HTMLInputElement
      if (input) {
        input.value = inputValue
        input.style.display = 'inline-block'
        input.dispatchEvent(new Event('input', { bubbles: true }))
      }
    }
  })
}

// 处理矩阵题
const handleMatrixQuestion = (questionElement: Element, question: Question) => {
  question.rows!.forEach((row, rowIndex) => {
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
      const inputElement = questionElement.querySelector(`input[name="q${question.index}_${rowIndex}"][value="${selectedOption.value}"]`) as HTMLInputElement
      if (inputElement) {
        const aElement = inputElement.previousElementSibling as HTMLAnchorElement
        if (aElement && aElement.tagName === 'A') {
          aElement.click()
        }
      }
    }
  })
}

// 处理文本题
const handleTextareaQuestion = (question: Question) => {
  const textareaElement = document.getElementById(question.textareaId!) as HTMLTextAreaElement
  if (textareaElement) {
    if (surveyStore.isAdvancedMode && question.textareaInputs) {
      textareaElement.value = question.textareaInputs.map(input => input.value).join('\n')
    } else {
      textareaElement.value = question.textareaValue || ''
    }
    // 触发 input 事件以确保任何相关的事件监听器都能被触发
    const event = new Event('input', { bubbles: true })
    textareaElement.dispatchEvent(event)
  }
}

// 修改处理下拉框题的函数
const handleSelectQuestion = (questionElement: Element, question: Question) => {
  const selectElement = questionElement.querySelector(`select[name="q${question.index}"]`) as HTMLSelectElement
  if (selectElement) {
    // 找到并选中对应的选项
    selectElement.value = question.selectedValue!

    // 触发 change 事件，以确保任何相关的事件监听器都能被触发
    const event = new Event('change', { bubbles: true })
    selectElement.dispatchEvent(event)

    // 更新 Select2 的显示文本
    // const select2Container = questionElement.querySelector('.select2-container') as HTMLElement
    // if (select2Container) {
    //   const selectedOption = selectElement.options[selectElement.selectedIndex]
    //   const spanElement = select2Container.querySelector('.select2-selection__rendered') as HTMLElement
    //   if (spanElement && selectedOption) {
    //     spanElement.textContent = selectedOption.text
    //     spanElement.setAttribute('title', selectedOption.text)
    //   }
    // }
  }
}

// 处理量表题
const handleScaleQuestion = (questionElement: Element, question: Question) => {
  if (question.scaleOptions) {
    const selectedOption = question.scaleOptions.find((option: ScaleOption) => option.isSelected)
    if (selectedOption) {
      const liElement = questionElement.querySelector(`li[value="${selectedOption.value}"]`) as HTMLLIElement
      if (liElement) {
        simulateHumanClick(liElement)
      }
    }
  }
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
  isAutoAnswerEnabled.value = !isAutoAnswerEnabled.value
  localStorage.setItem('autoAnswerEnabled', JSON.stringify(isAutoAnswerEnabled.value))

  if (isAutoAnswerEnabled.value) {
    const { hasUnanswered, unansweredQuestions } = surveyStore.hasUnansweredQuestions()
    if (hasUnanswered) {
      handleUnansweredQuestionFlow(unansweredQuestions)
      eventBus.emit('showToast', { message: `请先完成所有问题的回答。未完成的题号: ${unansweredQuestions.join(', ')}`, type: 'warning' })
      isAutoAnswerEnabled.value = false
      localStorage.setItem('autoAnswerEnabled', 'false')
      return
    }
    // 刷新页面
    window.location.reload()
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

const stopAutoAnswer = () => {
  surveyStore.setAutoAnswerEnabled(false)
  eventBus.emit('showToast', { message: '自动提交已停止', type: 'info' })
}

const handleManualSubmit = async () => {
  // 确保自动提交是关闭的，如果用户希望单次提交
  if (isAutoAnswerEnabled.value) {
    surveyStore.setAutoAnswerEnabled(false)
    eventBus.emit('showToast', { message: '自动提交已关闭', type: 'info' })
    await nextTick()
  }
  eventBus.emit('showToast', { message: '正在发起单次提交...', type: 'info' })
  const submissionSuccess = await fillSurveyAnswers()

  if (submissionSuccess) {
    eventBus.emit('showToast', { message: '单次提交成功！', type: 'success' })
    // 提交成功后，通常会由 fillSurveyAnswers 内部的 MutationObserver 监测到页面跳转并增加计数和重载
    // surveyStore.incrementSubmissionCount(); // 此行逻辑保留在 MutationObserver 中
  } else {
    // 具体失败原因已在 fillSurveyAnswers 或 handleVerification 内部提示。
    // eventBus.emit('showToast', { message: '单次提交未能完成，请检查问卷状态或验证信息。', type: 'warning' })
  }
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

  surveyStore.loadAutoAnswerEnabled()

  // 加载高级模式状态
  surveyStore.loadAdvancedMode()
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

.handle-tm,
.handle-bm {
  width: 100%;
  left: 0;
  margin-left: 0;
}

.handle-ml,
.handle-mr {
  height: 100%;
  top: 0;
  margin-top: 0;
}

.handle-tl,
.handle-tr,
.handle-bl,
.handle-br {
  width: 20px;
  height: 20px;
  margin: 0;
  z-index: 1;
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

@keyframes elegant-warning-pulse {
  0%,
  100% {
    background-color: #fefefe; /* QuestionDisplay 组件的默认背景色 */
    box-shadow: none; /* 假设默认非悬浮状态下没有阴影 */
    transform: scale(1);
  }
  50% {
    background-color: #fffde7; /* 一个非常浅的乳黄色，用于柔和提示 */
    /* 一个比默认更明显但不过于强烈的阴影，营造一种"焦点"感 */
    box-shadow:
      0 8px 16px -4px rgba(0, 0, 0, 0.1),
      0 4px 8px -3px rgba(0, 0, 0, 0.08);
    transform: scale(1.015); /* 轻微放大，增加强调 */
  }
}

.flash-warning {
  /* animation: flash-warning-animation 0.5s 3; */ /* 旧的动画引用将被替换 */
  animation: elegant-warning-pulse 0.7s ease-in-out 3; /* 动画持续0.7秒，执行3次，使用缓入缓出效果 */
}
</style>
