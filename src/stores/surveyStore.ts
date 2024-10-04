import { defineStore } from 'pinia'
import { ref } from 'vue'
import { parseSurvey } from '../utils/SurveyParser'
import { Question, Option } from '../types/survey'

export const useSurveyStore = defineStore('survey', () => {
  const questions = ref<Question[]>([])
  const isVisible = ref(true)
  const isAdvancedMode = ref(false)
  const submissionCount = ref(0)

  // 获取问卷ID
  const getSurveyId = () => {
    const match = window.location.href.match(/\/vj\/([^.]+)\.aspx/)
    return match ? match[1] : 'default'
  }

  // 保存数据到 localStorage
  const saveData = () => {
    const surveyId = getSurveyId()
    localStorage.setItem(`survey_${surveyId}`, JSON.stringify(questions.value))
  }

  // 从 localStorage 加载数据
  const loadData = () => {
    const surveyId = getSurveyId()
    const savedData = localStorage.getItem(`survey_${surveyId}`)
    if (savedData) {
      questions.value = JSON.parse(savedData)
    } else {
      parseAndUpdateSurvey()
    }
  }

  const parseAndUpdateSurvey = () => {
    const parsedQuestions = parseSurvey()

    // 如果已经有加载的数据，合并新解析的数据和已有数据
    if (questions.value.length > 0) {
      questions.value = questions.value.map((existingQuestion: Question, index: number) => {
        const parsedQuestion = parsedQuestions[index]
        if (parsedQuestion) {
          // 保留已有的选项状态和概率
          if (existingQuestion.options && parsedQuestion.options) {
            parsedQuestion.options = parsedQuestion.options.map((option, optionIndex) => ({
              ...option,
              isSelected: existingQuestion.options?.[optionIndex]?.isSelected ?? false,
              probability: existingQuestion.options?.[optionIndex]?.probability ?? 0,
            }))
          }
          // 保留已有的矩阵题状态和概率
          if (existingQuestion.rows && parsedQuestion.rows) {
            parsedQuestion.rows = parsedQuestion.rows.map((row, rowIndex) => ({
              ...row,
              options: row.options.map((option, optionIndex) => ({
                ...option,
                isSelected: existingQuestion.rows?.[rowIndex]?.options[optionIndex]?.isSelected || false,
                probability: existingQuestion.rows?.[rowIndex]?.options[optionIndex]?.probability || 0,
              })),
            }))
          }
          // 保留文本框的值
          if (existingQuestion.type === 'textarea' && parsedQuestion.type === 'textarea') {
            parsedQuestion.textareaValue = existingQuestion.textareaValue
          }
        }
        return parsedQuestion || existingQuestion
      })
    } else {
      questions.value = parsedQuestions
    }

    saveData() // 解析后保存数据
  }

  const toggleVisibility = () => {
    isVisible.value = !isVisible.value
  }

  const toggleMode = () => {
    isAdvancedMode.value = !isAdvancedMode.value
  }

  const updateQuestionOptions = (questionIndex: number, newOptions: Option[]) => {
    const questionToUpdate = questions.value.find((q: Question) => q.index === questionIndex)
    if (questionToUpdate) {
      questionToUpdate.options = newOptions
      saveData() // 更新选项后保存数据
    }
  }

  const updateQuestion = (questionIndex: number, updatedQuestion: Question) => {
    if (questions.value[questionIndex]) {
      questions.value[questionIndex] = updatedQuestion
      saveData() // 更新问题后保存数据
    }
  }

  const updateQuestionTextarea = (questionIndex: number, value: string) => {
    const questionToUpdate = questions.value.find((q: Question) => q.index === questionIndex)
    if (questionToUpdate && questionToUpdate.type === 'textarea') {
      questionToUpdate.textareaValue = value
      saveData() // 更新后保存数据
    }
  }

  const hasUnansweredQuestions = (): boolean => {
    return questions.value.some(question => {
      // 排除未知题型
      if (question.type === 'unknown') {
        return false
      }

      if (question.type === 'radio' || question.type === 'checkbox') {
        return !question.options?.some(option => option.isSelected)
      } else if (question.type === 'matrix' || question.type === 'matrix-multiple') {
        return question.rows?.some(row => !row.options.some(option => option.isSelected))
      } else if (question.type === 'textarea') {
        return !question.textareaValue || question.textareaValue.trim() === ''
      }
      return false
    })
  }

  const incrementSubmissionCount = () => {
    submissionCount.value++
    localStorage.setItem('submissionCount', submissionCount.value.toString())
  }

  const loadSubmissionCount = () => {
    const count = localStorage.getItem('submissionCount')
    submissionCount.value = count ? parseInt(count, 10) : 0
  }

  const resetSurvey = () => {
    const surveyId = getSurveyId()
    localStorage.removeItem(`survey_${surveyId}`)
    questions.value = [] // 清空 store 中的问题数据
    parseAndUpdateSurvey() // 重新解析问卷
  }

  const updateQuestionMatrix = (questionIndex: number, newRows: any[]) => {
    const questionToUpdate = questions.value.find((q: Question) => q.index === questionIndex)
    if (questionToUpdate && (questionToUpdate.type === 'matrix' || questionToUpdate.type === 'matrix-multiple')) {
      questionToUpdate.rows = newRows
      saveData()
    }
  }

  return {
    questions,
    isVisible,
    isAdvancedMode,
    parseAndUpdateSurvey,
    toggleVisibility,
    toggleMode,
    updateQuestionOptions,
    updateQuestion,
    loadData,
    saveData,
    hasUnansweredQuestions,
    submissionCount,
    incrementSubmissionCount,
    loadSubmissionCount,
    getSurveyId,
    resetSurvey,
    updateQuestionTextarea,
    updateQuestionMatrix,
  }
})
