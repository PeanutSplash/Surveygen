import { onUnmounted, ref, watch } from 'vue'
import { useSurveyStore } from '../stores/surveyStore'
import { useEventListener } from '@vueuse/core'

export function useSurveyObserver(surveyStore: ReturnType<typeof useSurveyStore>, scrollToQuestion: (index: number) => void) {
  const surveyContent = ref<HTMLElement | null>(null)

  const isAnswerSelection = (mutation: MutationRecord): boolean =>
    mutation.type === 'attributes' &&
    (mutation.target as Element).classList.contains('jqChecked') &&
    ((mutation.target as Element).classList.contains('jqRadio') || (mutation.target as Element).classList.contains('jqCheckbox'))

  const isTextAreaChange = (mutation: MutationRecord): boolean =>
    mutation.type === 'characterData' && (mutation.target.parentNode as Element).tagName.toLowerCase() === 'textarea'

  const updateQuestion = (questionElement: Element, questionIndex: number) => {
    const question = surveyStore.questions[questionIndex]
    if (!question) return

    const updateQuestionData = () => {
      if (question.type === 'radio' || question.type === 'checkbox') {
        if (!question.options?.some(option => option.isSelected)) {
          const options = questionElement.querySelectorAll('.ulradiocheck li')
          question.options = Array.from(options).map((option, index) => ({
            ...question.options?.[index],
            isSelected: option.querySelector('.jqChecked') !== null,
          }))
        }
      } else if (question.type === 'matrix') {
        if (!question.rows?.some(row => row.options.some(option => option.isSelected))) {
          const rows = questionElement.querySelectorAll('tbody tr')
          question.rows = Array.from(rows).map((row, rowIndex) => ({
            title: question.rows?.[rowIndex]?.title ?? '',
            options: Array.from(row.querySelectorAll('td')).map((td, optionIndex) => ({
              ...question.rows?.[rowIndex]?.options?.[optionIndex],
              isSelected: td.querySelector('.jqChecked') !== null,
            })),
          }))
        }
      } else if (question.type === 'textarea') {
        if (!question.textareaValue) {
          const textarea = questionElement.querySelector('textarea') as HTMLTextAreaElement
          if (textarea) {
            question.textareaValue = textarea.value
          }
        }
      }
      surveyStore.updateQuestion(questionIndex, question)
      scrollToQuestion(questionIndex + 1)
    }

    updateQuestionData()
    surveyStore.saveData()
  }

  const handleMutations = (mutations: MutationRecord[]) => {
    const hasRelevantChange = mutations.some(mutation => isAnswerSelection(mutation) || isTextAreaChange(mutation))

    if (hasRelevantChange && surveyContent.value) {
      mutations.forEach(mutation => {
        if (isAnswerSelection(mutation) || isTextAreaChange(mutation)) {
          const questionElement = (mutation.target as Element).closest('.div_question')
          if (questionElement && surveyContent.value) {
            const questionIndex = Array.from(surveyContent.value.querySelectorAll('.div_question')).indexOf(questionElement as Element)
            updateQuestion(questionElement, questionIndex)
          }
        }
      })
    }
  }

  const handleTextareaInput = (event: Event) => {
    if ((event.target as HTMLElement).tagName.toLowerCase() === 'textarea' && surveyContent.value) {
      const questionElement = (event.target as Element).closest('.div_question')
      if (questionElement && surveyContent.value) {
        const questionIndex = Array.from(surveyContent.value.querySelectorAll('.div_question')).indexOf(questionElement as Element)
        updateQuestion(questionElement, questionIndex)
      }
    }
  }

  let observer: MutationObserver | null = null

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
          attributeFilter: ['class'],
          characterData: true,
        })

        useEventListener(newSurveyContent, 'input', handleTextareaInput)
      }
    },
    { immediate: true },
  )

  onUnmounted(() => {
    observer?.disconnect()
  })
}
