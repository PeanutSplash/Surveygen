import { onUnmounted } from 'vue'
import { useSurveyStore } from '../stores/surveyStore'

export function useSurveyObserver(surveyStore: ReturnType<typeof useSurveyStore>, scrollToQuestion: (index: number) => void) {
  const isAnswerSelection = (mutation: MutationRecord): boolean => {
    return (
      (mutation.type === 'attributes' &&
        (mutation.target as Element).classList.contains('jqRadio') &&
        (mutation.target as Element).classList.contains('jqChecked')) ||
      ((mutation.target as Element).classList.contains('jqCheckbox') && (mutation.target as Element).classList.contains('jqChecked'))
    )
  }

  const isTextAreaChange = (mutation: MutationRecord): boolean => {
    return mutation.type === 'characterData' && (mutation.target.parentNode as Element).tagName.toLowerCase() === 'textarea'
  }

  let observer: MutationObserver | null = null

  const surveyContent = document.getElementById('ctl00_ContentPlaceHolder1_JQ1_surveyContent')
  if (surveyContent) {
    observer = new MutationObserver(mutations => {
      const hasAnswerSelection = mutations.some(isAnswerSelection)
      const hasTextAreaChange = mutations.some(isTextAreaChange)

      if (hasAnswerSelection || hasTextAreaChange) {
        mutations.forEach(mutation => {
          if (isAnswerSelection(mutation) || isTextAreaChange(mutation)) {
            const questionElement = (mutation.target as Element).closest('.div_question')
            if (questionElement) {
              const questionIndex = Array.from(surveyContent.querySelectorAll('.div_question')).indexOf(questionElement as Element)
              const question = surveyStore.questions[questionIndex]
              if (question) {
                // 只有当本地没有保存答案时才更新
                if (question.type === 'radio' || question.type === 'checkbox') {
                  if (!question.options?.some(option => option.isSelected)) {
                    const options = questionElement.querySelectorAll('.ulradiocheck li')
                    question.options = Array.from(options).map((option, index) => ({
                      ...question.options[index],
                      isSelected: option.querySelector('.jqChecked') !== null
                    }))
                    surveyStore.updateQuestion(questionIndex, question)
                  }
                } else if (question.type === 'matrix') {
                  if (!question.rows?.some(row => row.options.some(option => option.isSelected))) {
                    const rows = questionElement.querySelectorAll('tbody tr')
                    question.rows = Array.from(rows).map((row, rowIndex) => ({
                      ...question.rows[rowIndex],
                      options: Array.from(row.querySelectorAll('td')).map((td, optionIndex) => ({
                        ...question.rows[rowIndex].options[optionIndex],
                        isSelected: td.querySelector('.jqChecked') !== null
                      }))
                    }))
                    surveyStore.updateQuestion(questionIndex, question)
                  }
                } else if (question.type === 'textarea') {
                  if (!question.textareaValue) {
                    const textarea = questionElement.querySelector('textarea') as HTMLTextAreaElement
                    if (textarea) {
                      question.textareaValue = textarea.value
                      surveyStore.updateQuestion(questionIndex, question)
                    }
                  }
                }
                scrollToQuestion(questionIndex + 1)
              }
            }
          }
        })
        surveyStore.saveData()
      }
    })

    observer.observe(surveyContent, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
      characterData: true,
    })

    // 添加输入事件监听器
    surveyContent.addEventListener('input', event => {
      if ((event.target as HTMLElement).tagName.toLowerCase() === 'textarea') {
        const questionElement = (event.target as Element).closest('.div_question')
        if (questionElement) {
          const questionIndex = Array.from(surveyContent.querySelectorAll('.div_question')).indexOf(questionElement as Element)
          const question = surveyStore.questions[questionIndex]
          if (question && question.type === 'textarea') {
            question.textareaValue = (event.target as HTMLTextAreaElement).value
            surveyStore.updateQuestion(questionIndex, question)
            surveyStore.saveData()
          }
        }
      }
    })
  }

  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
    }
    if (surveyContent) {
      surveyContent.removeEventListener('input', () => {})
    }
  })
}
