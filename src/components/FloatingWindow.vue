<template>
  <div v-if="isVisible" class="!pointer-events-none !fixed !inset-0 !z-50">
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
        <div class="drag-handle cursor-move select-none bg-gray-100 p-2 text-lg font-semibold">问卷解析结果</div>
        <div ref="scrollContainer" class="flex-1 overflow-auto p-4" @wheel="handleScroll">
          <div v-if="questions.length === 0">正在解析问卷...</div>
          <QuestionDisplay
            v-for="question in questions"
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
import { parseSurvey, Question } from './SurveyParser'
import QuestionDisplay from './QuestionDisplay.vue'

const isVisible = ref(true)
const questions = ref<Question[]>([])
const questionRefs = ref<{ [key: number]: any }>({})
const scrollContainer = ref<HTMLElement | null>(null)

const toggleVisibility = (event: KeyboardEvent) => {
  if (event.key === 'F3') {
    isVisible.value = !isVisible.value
  }
}

const parseAndUpdateSurvey = () => {
  questions.value = parseSurvey()
}

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

const isAnswerSelection = (mutation: MutationRecord): boolean => {
  // 检查是否是答案选择的变化
  return (
    mutation.type === 'attributes' && (mutation.target as Element).classList.contains('jqRadio') && (mutation.target as Element).classList.contains('jqChecked')
  )
}

let observer: MutationObserver | null = null

onMounted(() => {
  const dragHandle = document.querySelector('.drag-handle') as HTMLElement
  if (dragHandle) {
    dragHandle.style.touchAction = 'none'
  }

  window.addEventListener('keydown', toggleVisibility)

  // 初始解析
  parseAndUpdateSurvey()

  // 设置 MutationObserver
  const surveyContent = document.getElementById('ctl00_ContentPlaceHolder1_JQ1_surveyContent')
  if (surveyContent) {
    observer = new MutationObserver(mutations => {
      // 检查是否有答案选择的变化
      const hasAnswerSelection = mutations.some(isAnswerSelection)

      if (hasAnswerSelection) {
        // 当发生答案选择变化时，重新解析问卷
        parseAndUpdateSurvey()

        // 找到发生变化的问题索引
        const changedQuestionIndex = mutations.reduce((index, mutation) => {
          if (isAnswerSelection(mutation)) {
            const questionElement = (mutation.target as Element).closest('.div_question')
            if (questionElement) {
              const questionIndex = Array.from(surveyContent.querySelectorAll('.div_question')).indexOf(questionElement as Element) + 1
              return questionIndex > index ? questionIndex : index
            }
          }
          return index
        }, 0)

        // 如果找到了变化的问题，滚动到该问题
        if (changedQuestionIndex > 0) {
          nextTick(() => {
            scrollToQuestion(changedQuestionIndex)
          })
        }
      }
    })

    observer.observe(surveyContent, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class'], // 只观察 class 属性的变化
      characterData: false, // 不需要观察文本内容的变化
    })
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', toggleVisibility)
  if (observer) {
    observer.disconnect()
  }
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
