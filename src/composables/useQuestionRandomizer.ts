/**
 * 问题随机化相关的 composable
 */
import { type Ref } from 'vue'
import type { Question } from '../types/survey'
import { useSurveyStore } from '../stores/surveyStore'
import { randomizeOptions, randomizeTextareaOptions } from '../utils/randomizationHelpers'

export const useQuestionRandomizer = (
  question: Ref<Question>,
  isEditingProbability: Ref<boolean>,
  editedProbabilities: Ref<number[]>,
  editedMatrixProbabilities: Ref<number[][]>,
) => {
  const surveyStore = useSurveyStore()

  const randomizeQuestion = () => {
    if (question.value.options) {
      randomizeOptions(question.value.options)
      if (isEditingProbability.value) {
        editedProbabilities.value = question.value.options.map(o => o.probability)
      }
    } else if (question.value.rows) {
      question.value.rows.forEach(row => randomizeOptions(row.options))
      if (isEditingProbability.value) {
        editedMatrixProbabilities.value = question.value.rows.map(row => row.options.map(option => option.probability))
      }
    } else if (question.value.selectOptions) {
      randomizeOptions(question.value.selectOptions)
      if (isEditingProbability.value) {
        editedProbabilities.value = question.value.selectOptions.map(o => o.probability)
      }
    } else if (question.value.scaleOptions) {
      randomizeOptions(question.value.scaleOptions)
      if (isEditingProbability.value) {
        editedProbabilities.value = question.value.scaleOptions.map(o => o.probability)
      }
    } else if (question.value.textareaInputs) {
      randomizeTextareaOptions(question.value.textareaInputs)
      if (isEditingProbability.value) {
        editedProbabilities.value = question.value.textareaInputs.map(input => input.probability || 0)
      }
    }

    // 更新到store
    if (question.value.options) {
      surveyStore.updateQuestionOptions(question.value.index, question.value.options || [])
    } else if (question.value.rows) {
      surveyStore.updateQuestionMatrix(question.value.index, question.value.rows)
    } else if (question.value.selectOptions) {
      surveyStore.updateQuestionSelectOptions(question.value.index, question.value.selectOptions, question.value.selectedValue || '')
    } else if (question.value.scaleOptions) {
      surveyStore.updateQuestionScaleOptions(question.value.index, question.value.scaleOptions)
    } else if (question.value.textareaInputs) {
      surveyStore.updateQuestionTextareaInputs(question.value.index, question.value.textareaInputs)
    }
  }

  return {
    randomizeQuestion,
  }
}
