import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
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

  const getQuestionByIndex = computed(() => {
    return (index: number) => questions.value.find(q => q.index === index)
  })

  return {
    questions,
    isVisible,
    parseAndUpdateSurvey,
    toggleVisibility,
    getQuestionByIndex
  }
})