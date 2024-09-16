import { defineStore } from 'pinia'
import { ref } from 'vue'
import { parseSurvey, Question } from '../components/SurveyParser'

export const useSurveyStore = defineStore('survey', () => {
  const questions = ref<Question[]>([])
  const isVisible = ref(true)

  const parseAndUpdateSurvey = () => {
    questions.value = parseSurvey()
  }

  const toggleVisibility = () => {
    isVisible.value = !isVisible.value
  }

  return {
    questions,
    isVisible,
    parseAndUpdateSurvey,
    toggleVisibility
  }
})