import { onUnmounted, ref, watch } from 'vue'
import { useSurveyStore } from '../stores/surveyStore'
import { useEventListener } from '@vueuse/core'

/**
 * 调查问卷 DOM 变化观察器
 *
 * @description
 * 该组合式函数用于监控调查问卷中各类题型的答案变化，包括：
 * - 单选题：监控 .jqRadio 元素的 class 变化
 * - 多选题：监控 .jqCheckbox 元素的 class 变化
 * - 文本输入题：通过 MutationObserver 和 input 事件监控 textarea 内容变化
 * - 矩阵题：监控 .jqRadio 和 .jqCheckbox 元素的 class 变化
 * - 下拉选择题：监控 select 元素的 title 属性变化（Select2 插件）
 * - 量表题：监控 .div_table_radio_question 内 li 元素的 class 变化
 *
 * @param surveyStore - 调查问卷状态管理实例
 * @param scrollToQuestion - 滚动到指定问题的回调函数
 */
export function useSurveyObserver(surveyStore: ReturnType<typeof useSurveyStore>, scrollToQuestion: (index: number) => void) {
  const surveyContent = ref<HTMLElement | null>(null)

  /**
   * 判断是否为答案选择操作
   * @param mutation - DOM 变动记录
   * @returns 是否为答案选择操作
   */
  const isAnswerSelection = (mutation: MutationRecord): boolean =>
    mutation.type === 'attributes' &&
    (mutation.target as Element).classList.contains('jqChecked') &&
    ((mutation.target as Element).classList.contains('jqRadio') || (mutation.target as Element).classList.contains('jqCheckbox'))

  /**
   * 判断是否为文本区域内容变化
   * @param mutation - DOM 变动记录
   * @returns 是否为文本区域变化
   */
  const isTextAreaChange = (mutation: MutationRecord): boolean =>
    mutation.type === 'characterData' && (mutation.target.parentNode as Element).tagName.toLowerCase() === 'textarea'

  /**
   * 判断是否为下拉框选择变化
   * @param mutation - DOM 变动记录
   * @returns 是否为下拉框变化
   */
  const isSelectChange = (mutation: MutationRecord): boolean =>
    mutation.type === 'attributes' && mutation.attributeName === 'title' && (mutation.target as Element).classList.contains('select2-selection__rendered')

  /**
   * 判断是否为量表题选择变化
   * @param mutation - DOM 变动记录
   * @returns 是否为量表题变化
   */
  const isScaleChange = (mutation: MutationRecord): boolean =>
    mutation.type === 'attributes' &&
    mutation.attributeName === 'class' &&
    (mutation.target as Element).tagName.toLowerCase() === 'li' &&
    (mutation.target as Element).closest('.div_table_radio_question') !== null

  /**
   * 处理问题变化并滚动到下一题
   * @param questionIndex - 当前问题索引
   */
  const handleQuestionChange = (questionIndex: number) => {
    scrollToQuestion(questionIndex + 1)
  }

  /**
   * 处理 DOM 变动记录
   * @param mutations - DOM 变动记录数组
   */
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

  /**
   * 处理文本区域输入事件
   * @param event - 输入事件对象
   */
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

  // 监听调查问卷内容区域
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

  // 组件卸载时清理观察器
  onUnmounted(() => {
    observer?.disconnect()
  })
}
