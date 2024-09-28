import { defineStore } from 'pinia'
import { ref } from 'vue'
import { parseSurvey, Question, Option } from '../components/SurveyParser'

export const useSurveyStore = defineStore('survey', () => {
  const questions = ref<Question[]>([])
  const isVisible = ref(true)
  const isAutoMode = ref(false)

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
              probability: existingQuestion.options?.[optionIndex]?.probability ?? 0
            }))
          }
          // 保留已有的矩阵题状态和概率
          if (existingQuestion.rows && parsedQuestion.rows) {
            parsedQuestion.rows = parsedQuestion.rows.map((row, rowIndex) => ({
              ...row,
              options: row.options.map((option, optionIndex) => ({
                ...option,
                isSelected: existingQuestion.rows?.[rowIndex]?.options[optionIndex]?.isSelected || false,
                probability: existingQuestion.rows?.[rowIndex]?.options[optionIndex]?.probability || 0
              }))
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
    isAutoMode.value = !isAutoMode.value
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

  const hasUnansweredQuestions = (): boolean => {
    return questions.value.some(question => {
      if (question.type === 'radio' || question.type === 'checkbox') {
        return !question.options?.some(option => option.isSelected)
      } else if (question.type === 'matrix') {
        return question.rows?.some(row => !row.options.some(option => option.isSelected))
      } else if (question.type === 'textarea') {
        return !question.textareaValue || question.textareaValue.trim() === ''
      }
      return false
    })
  }

  return {
    questions,
    isVisible,
    isAutoMode,
    parseAndUpdateSurvey,
    toggleVisibility,
    toggleMode,
    updateQuestionOptions,
    updateQuestion, // 添加这个新方法
    loadData,
    saveData,
    hasUnansweredQuestions,
  }
})
