import { defineStore } from 'pinia'
import { ref } from 'vue'
import { parseSurvey } from '../utils/SurveyParser'
import { Question, Option, ScaleOption } from '../types/survey'

export const useSurveyStore = defineStore('survey', () => {
  // 状态定义
  /** 问卷问题列表 */
  const questions = ref<Question[]>([])
  /** 问卷窗口是否可见 */
  const isVisible = ref(true)
  /** 是否启用高级模式 */
  const isAdvancedMode = ref(false)
  /** 提交次数计数 */
  const submissionCount = ref(0)
  /** 是否启用自动答题 */
  const isAutoAnswerEnabled = ref(false)

  /**
   * 从 URL 中获取问卷 ID
   * @returns {string} 问卷 ID，如果未找到则返回 'default'
   */
  const getSurveyId = () => {
    const match = window.location.href.match(/\/vj\/([^.]+)\.aspx/)
    return match ? match[1] : 'default'
  }

  /**
   * 保存问卷数据到 localStorage
   */
  const saveData = () => {
    const surveyId = getSurveyId()
    localStorage.setItem(`survey_${surveyId}`, JSON.stringify(questions.value))
  }

  /**
   * 从 localStorage 加载问卷数据
   * 如果没有保存的数据，则解析并更新问卷
   */
  const loadData = () => {
    const surveyId = getSurveyId()
    const savedData = localStorage.getItem(`survey_${surveyId}`)
    if (savedData) {
      questions.value = JSON.parse(savedData)
    } else {
      parseAndUpdateSurvey()
    }
  }

  /**
   * 解析并更新问卷数据
   * 保留现有问题的答案状态
   */
  const parseAndUpdateSurvey = () => {
    const parsedQuestions = parseSurvey()
    if (questions.value.length > 0) {
      questions.value = questions.value.map((existingQuestion: Question, index: number) => {
        const parsedQuestion = parsedQuestions[index]
        if (parsedQuestion) {
          // 更新选项状态
          if (existingQuestion.options && parsedQuestion.options) {
            parsedQuestion.options = parsedQuestion.options.map((option, optionIndex) => ({
              ...option,
              isSelected: existingQuestion.options?.[optionIndex]?.isSelected ?? false,
              probability: existingQuestion.options?.[optionIndex]?.probability ?? 0,
            }))
          }
          // 更新矩阵问题状态
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
          // 更新文本域问题状态
          if (existingQuestion.type === 'textarea' && parsedQuestion.type === 'textarea') {
            parsedQuestion.textareaValue = existingQuestion.textareaValue
          }
          // 更新选择问题状态
          if (existingQuestion.type === 'select' && parsedQuestion.type === 'select') {
            parsedQuestion.selectOptions = existingQuestion.selectOptions
            parsedQuestion.selectedValue = existingQuestion.selectedValue
          }
        }
        return parsedQuestion || existingQuestion
      })
    } else {
      questions.value = parsedQuestions
    }

    saveData()
  }

  /**
   * 切换问卷窗口可见性
   */
  const toggleVisibility = () => {
    isVisible.value = !isVisible.value
  }

  /**
   * 切换高级模式
   */
  const toggleMode = () => {
    isAdvancedMode.value = !isAdvancedMode.value
    localStorage.setItem('isAdvancedMode', JSON.stringify(isAdvancedMode.value))
  }

  /**
   * 更新问题选项
   * @param questionIndex - 问题索引
   * @param newOptions - 新的选项数组
   */
  const updateQuestionOptions = (questionIndex: number, newOptions: Option[]) => {
    const questionToUpdate = questions.value.find((q: Question) => q.index === questionIndex)
    if (questionToUpdate) {
      questionToUpdate.options = newOptions
      saveData()
    }
  }

  /**
   * 更新整个问题
   * @param questionIndex - 问题索引
   * @param updatedQuestion - 更新后的问题对象
   */
  const updateQuestion = (questionIndex: number, updatedQuestion: Question) => {
    if (questions.value[questionIndex]) {
      questions.value[questionIndex] = updatedQuestion
      saveData()
    }
  }

  /**
   * 更新文本域问题的值
   * @param questionIndex - 问题索引
   * @param value - 新的文本值
   */
  const updateQuestionTextarea = (questionIndex: number, value: string) => {
    const questionToUpdate = questions.value.find((q: Question) => q.index === questionIndex)
    if (questionToUpdate && questionToUpdate.type === 'textarea') {
      questionToUpdate.textareaValue = value
      saveData()
    }
  }

  /**
   * 检查是否有未回答的问题
   * @returns {Object} 包含未回答状态和未回答问题索引的对象
   */
  const hasUnansweredQuestions = (): { hasUnanswered: boolean; unansweredQuestions: number[] } => {
    const unansweredQuestions: number[] = []

    questions.value.forEach(question => {
      if (question.type === 'unknown') {
        return
      }

      let isUnanswered = false

      // 根据问题类型检查是否已回答
      if (question.type === 'radio' || question.type === 'checkbox') {
        isUnanswered = !question.options?.some(option => option.isSelected)
      } else if (question.type === 'matrix' || question.type === 'matrix-multiple') {
        isUnanswered = question.rows ? question.rows.some(row => !row.options.some(option => option.isSelected)) : true
      } else if (question.type === 'textarea') {
        isUnanswered = !question.textareaValue || question.textareaValue.trim() === ''
      } else if (question.type === 'scale') {
        isUnanswered = !question.scaleOptions?.some(option => option.isSelected)
      } else if (question.type === 'select') {
        isUnanswered = !question.selectedValue
      }

      if (isUnanswered) {
        unansweredQuestions.push(question.index)
      }
    })

    console.log('未完成的题目:', unansweredQuestions)

    return { hasUnanswered: unansweredQuestions.length > 0, unansweredQuestions }
  }

  /**
   * 增加提交计数
   */
  const incrementSubmissionCount = () => {
    submissionCount.value++
    localStorage.setItem('submissionCount', submissionCount.value.toString())
  }

  /**
   * 加载提交计数
   */
  const loadSubmissionCount = () => {
    const count = localStorage.getItem('submissionCount')
    submissionCount.value = count ? parseInt(count, 10) : 0
  }

  /**
   * 重置问卷
   */
  const resetSurvey = () => {
    const surveyId = getSurveyId()
    localStorage.removeItem(`survey_${surveyId}`)
    questions.value = []
    parseAndUpdateSurvey()
  }

  /**
   * 更新矩阵问题
   * @param questionIndex - 问题索引
   * @param newRows - 新的行数据
   */
  const updateQuestionMatrix = (questionIndex: number, newRows: any[]) => {
    const questionToUpdate = questions.value.find((q: Question) => q.index === questionIndex)
    if (questionToUpdate && (questionToUpdate.type === 'matrix' || questionToUpdate.type === 'matrix-multiple')) {
      questionToUpdate.rows = newRows
      saveData()
    }
  }

  /**
   * 更新选择问题选项
   * @param questionIndex - 问题索引
   * @param newSelectOptions - 新的选项数组
   * @param selectedValue - 选中的值
   */
  const updateQuestionSelectOptions = (questionIndex: number, newSelectOptions: Option[], selectedValue: string) => {
    const questionToUpdate = questions.value.find((q: Question) => q.index === questionIndex)
    if (questionToUpdate && questionToUpdate.type === 'select') {
      questionToUpdate.selectOptions = newSelectOptions
      questionToUpdate.selectedValue = selectedValue
      saveData()
    }
  }

  /**
   * 更新量表问题选项
   * @param questionIndex - 问题索引
   * @param newScaleOptions - 新的量表选项数组
   */
  const updateQuestionScaleOptions = (questionIndex: number, newScaleOptions: ScaleOption[]) => {
    const questionToUpdate = questions.value.find((q: Question) => q.index === questionIndex)
    if (questionToUpdate && questionToUpdate.type === 'scale') {
      questionToUpdate.scaleOptions = newScaleOptions
      saveData()
    }
  }

  /**
   * 更新文本域问题的输入
   * @param questionIndex - 问题索引
   * @param inputs - 新的输入数组
   */
  const updateQuestionTextareaInputs = (questionIndex: number, inputs: { value: string }[]) => {
    const questionToUpdate = questions.value.find((q: Question) => q.index === questionIndex)
    if (questionToUpdate && questionToUpdate.type === 'textarea') {
      questionToUpdate.textareaInputs = inputs
      questionToUpdate.textareaValue = inputs.map(input => input.value).join('\n')
      saveData()
    }
  }

  /**
   * 加载自动答题状态
   */
  const loadAutoAnswerEnabled = () => {
    const storedAutoAnswerEnabled = localStorage.getItem('autoAnswerEnabled')
    if (storedAutoAnswerEnabled !== null) {
      isAutoAnswerEnabled.value = JSON.parse(storedAutoAnswerEnabled)
    }
  }

  /**
   * 设置自动答题状态
   * @param value - 新的自动答题状态
   */
  const setAutoAnswerEnabled = (value: boolean) => {
    isAutoAnswerEnabled.value = value
    localStorage.setItem('autoAnswerEnabled', JSON.stringify(value))
  }

  /**
   * 加载高级模式状态
   */
  const loadAdvancedMode = () => {
    const storedAdvancedMode = localStorage.getItem('isAdvancedMode')
    if (storedAdvancedMode !== null) {
      isAdvancedMode.value = JSON.parse(storedAdvancedMode)
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
    updateQuestionSelectOptions,
    updateQuestionScaleOptions,
    updateQuestionTextareaInputs,
    isAutoAnswerEnabled,
    loadAutoAnswerEnabled,
    setAutoAnswerEnabled,
    loadAdvancedMode,
  }
})
