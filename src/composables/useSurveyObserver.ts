import { onUnmounted } from 'vue'
import { useSurveyStore } from '../stores/surveyStore'

export function useSurveyObserver(surveyStore: ReturnType<typeof useSurveyStore>, scrollToQuestion: (index: number) => void) {
  const isAnswerSelection = (mutation: MutationRecord): boolean => {
    return (
      mutation.type === 'attributes' && 
      ((mutation.target as Element).classList.contains('jqRadio') && 
       (mutation.target as Element).classList.contains('jqChecked')) ||
      ((mutation.target as Element).classList.contains('jqCheckbox') && 
       (mutation.target as Element).classList.contains('jqChecked'))
    )
  }

  const isTextAreaChange = (mutation: MutationRecord): boolean => {
    return mutation.type === 'characterData' && 
           (mutation.target.parentNode as Element).tagName.toLowerCase() === 'textarea'
  }

  let observer: MutationObserver | null = null

  const surveyContent = document.getElementById('ctl00_ContentPlaceHolder1_JQ1_surveyContent')
  if (surveyContent) {
    observer = new MutationObserver(mutations => {
      const hasAnswerSelection = mutations.some(isAnswerSelection)
      const hasTextAreaChange = mutations.some(isTextAreaChange)

      if (hasAnswerSelection || hasTextAreaChange) {
        surveyStore.parseAndUpdateSurvey()

        const changedQuestionIndex = mutations.reduce((index, mutation) => {
          if (isAnswerSelection(mutation) || isTextAreaChange(mutation)) {
            const questionElement = (mutation.target as Element).closest('.div_question')
            if (questionElement) {
              const questionIndex = Array.from(surveyContent.querySelectorAll('.div_question')).indexOf(questionElement as Element) + 1
              return questionIndex > index ? questionIndex : index
            }
          }
          return index
        }, 0)

        if (changedQuestionIndex > 0) {
          scrollToQuestion(changedQuestionIndex)
        }
      }
    })

    observer.observe(surveyContent, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
      characterData: true
    })

    // 添加输入事件监听器
    surveyContent.addEventListener('input', (event) => {
      if ((event.target as HTMLElement).tagName.toLowerCase() === 'textarea') {
        surveyStore.parseAndUpdateSurvey()
      }
    })
  }

  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
    }
    if (surveyContent) {
      surveyContent.removeEventListener('input', (event) => {
        if ((event.target as HTMLElement).tagName.toLowerCase() === 'textarea') {
          surveyStore.parseAndUpdateSurvey()
        }
      })
    }
  })
}