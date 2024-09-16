import { defineStore } from 'pinia'
import { ref } from 'vue'
import { parseSurvey, Question, Option } from '../components/SurveyParser'

export const useSurveyStore = defineStore('survey', () => {
  const questions = ref<Question[]>([])
  const isVisible = ref(true)
  const isAutoMode = ref(false)

  const parseAndUpdateSurvey = () => {
    questions.value = parseSurvey()
    // 概率已经在 SurveyParser 中设置，这里不需要额外处理
  }

  const toggleVisibility = () => {
    isVisible.value = !isVisible.value
  }

  const toggleMode = () => {
    isAutoMode.value = !isAutoMode.value
  }

  const updateQuestionOptions = (questionIndex: number, newOptions: Option[]) => {
    const questionToUpdate = questions.value.find(q => q.index === questionIndex)
    if (questionToUpdate) {
      questionToUpdate.options = newOptions
    }
  }

  return {
    questions,
    isVisible,
    isAutoMode,
    parseAndUpdateSurvey,
    toggleVisibility,
    toggleMode,
    updateQuestionOptions
  }
})