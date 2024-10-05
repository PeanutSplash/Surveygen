import { onUnmounted, ref, watch } from 'vue'
import { useSurveyStore } from '../stores/surveyStore'
import { useEventListener } from '@vueuse/core'

/**
 * useSurveyObserver 组合式函数
 *
 * 该函数用于观察调查问卷的 DOM 变化，实现了以下题型的监控：
 * 1. 单选题：通过监听 .jqRadio 元素的 class 变化来检测
 * 2. 多选题：通过监听 .jqCheckbox 元素的 class 变化来检测
 * 3. 文本输入题：
 *    a) 通过 MutationObserver 监听 textarea 元素的内容变化
 *    b) 通过 input 事件监听实时输入
 * 4. 矩阵题：通过监听 .jqRadio 和 .jqCheckbox 元素的 class 变化来检测
 * 5. 下拉选择题：通过监听 select 元素的 title 属性变化来检测（适用于 Select2 插件）
 * 6. 量表题：通过监听 .div_table_radio_question 内 li 元素的 class 变化来检测
 *
 * 当检测到答案变化时，会自动滚动到下一个问题。
 *
 * 注意：当前实现仅进行滚动操作，不包括答案的保存或其他逻辑处理。
 */
export function useSurveyObserver(surveyStore: ReturnType<typeof useSurveyStore>, scrollToQuestion: (index: number) => void) {
  const surveyContent = ref<HTMLElement | null>(null)

  // 检查变动记录是否为选择答案的操作
  const isAnswerSelection = (mutation: MutationRecord): boolean =>
    mutation.type === 'attributes' &&
    (mutation.target as Element).classList.contains('jqChecked') &&
    ((mutation.target as Element).classList.contains('jqRadio') || (mutation.target as Element).classList.contains('jqCheckbox'))

  // 检查变动记录是否为文本区域的更改
  const isTextAreaChange = (mutation: MutationRecord): boolean =>
    mutation.type === 'characterData' && (mutation.target.parentNode as Element).tagName.toLowerCase() === 'textarea'

  // 检查变动记录是否为下拉框的更改
  const isSelectChange = (mutation: MutationRecord): boolean =>
    mutation.type === 'attributes' && mutation.attributeName === 'title' && (mutation.target as Element).classList.contains('select2-selection__rendered')

  // 检查变动记录是否为量表题的更改
  const isScaleChange = (mutation: MutationRecord): boolean =>
    mutation.type === 'attributes' &&
    mutation.attributeName === 'class' &&
    (mutation.target as Element).tagName.toLowerCase() === 'li' &&
    (mutation.target as Element).closest('.div_table_radio_question') !== null

  // 处理问题变化，只进行滚动
  const handleQuestionChange = (questionIndex: number) => {
    scrollToQuestion(questionIndex + 1) // 滚动到下一个问题
  }

  // 处理 MutationObserver 监控到的变动
  const handleMutations = (mutations: MutationRecord[]) => {
    const hasRelevantChange = mutations.some(
      mutation => isAnswerSelection(mutation) || isTextAreaChange(mutation) || isSelectChange(mutation) || isScaleChange(mutation),
    )

    if (hasRelevantChange && surveyContent.value) {
      mutations.forEach(mutation => {
        if (isAnswerSelection(mutation) || isTextAreaChange(mutation) || isSelectChange(mutation) || isScaleChange(mutation)) {
          const questionElement = (mutation.target as Element).closest('.div_question')
          if (questionElement && surveyContent.value) {
            const questionIndex = Array.from(surveyContent.value.querySelectorAll('.div_question')).indexOf(questionElement as Element)
            handleQuestionChange(questionIndex)
          }
        }
      })
    }
  }

  // 处理文本区域输入事件
  const handleTextareaInput = (event: Event) => {
    if ((event.target as HTMLElement).tagName.toLowerCase() === 'textarea' && surveyContent.value) {
      const questionElement = (event.target as Element).closest('.div_question')
      if (questionElement && surveyContent.value) {
        const questionIndex = Array.from(surveyContent.value.querySelectorAll('.div_question')).indexOf(questionElement as Element)
        handleQuestionChange(questionIndex)
      }
    }
  }

  let observer: MutationObserver | null = null

  // 监听调查内容的 DOM 变化
  watch(
    () => document.getElementById('ctl00_ContentPlaceHolder1_JQ1_surveyContent'),
    newSurveyContent => {
      if (newSurveyContent) {
        surveyContent.value = newSurveyContent
        observer = new MutationObserver(handleMutations)
        observer.observe(newSurveyContent, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['class', 'title'],
          characterData: true,
        })

        useEventListener(newSurveyContent, 'input', handleTextareaInput)
      }
    },
    { immediate: true },
  )

  // 组件卸载时断开 MutationObserver
  onUnmounted(() => {
    observer?.disconnect()
  })
}
