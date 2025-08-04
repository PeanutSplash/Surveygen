/**
 * 概率编辑相关的 composable
 */
import { ref, computed, type Ref } from 'vue'
import type { Question } from '../types/survey'
import { useSurveyStore } from '../stores/surveyStore'
import eventBus from '../utils/eventBus'
import { calculatePresetDistribution, calculateRangeDistribution, type DistributionType } from '../utils/probabilityDistribution'
import type { RangeConfig } from '../components/ProbabilityEditor.vue'

export const useProbabilityEditor = (question: Ref<Question>) => {
  const surveyStore = useSurveyStore()

  const isEditingProbability = ref(false)
  const editedProbabilities = ref<number[]>([])
  const editedMatrixProbabilities = ref<number[][]>([])
  const probabilityEditMode = ref<'quick' | 'range' | 'manual'>('quick')
  const selectedRange = ref<RangeConfig>({ start: 0, end: 0, weight: 70 })

  // 为矩阵题创建扁平化选项（用于概率编辑器）
  const flattenedMatrixOptions = computed(() => {
    if (!question.value.rows) return []
    return question.value.rows.flatMap(row =>
      row.options.map((option, optionIndex) => ({
        value: optionIndex + 1,
        label: `选项${optionIndex + 1}`,
        probability: option.probability,
        isSelected: option.isSelected,
      })),
    )
  })

  const startEditProbability = () => {
    if (question.value.options) {
      editedProbabilities.value = question.value.options.map(o => o.probability)
    } else if (question.value.selectOptions) {
      editedProbabilities.value = question.value.selectOptions.map(o => o.probability)
    } else if (question.value.scaleOptions) {
      editedProbabilities.value = question.value.scaleOptions.map(o => o.probability)
      // 初始化区间设置
      selectedRange.value = {
        start: 0,
        end: Math.max(0, question.value.scaleOptions.length - 1),
        weight: 70,
      }
    } else if (question.value.textareaInputs) {
      editedProbabilities.value = question.value.textareaInputs.map(input => input.probability || 0)
    } else if (question.value.rows) {
      // 矩阵题：创建编辑用的概率数组
      editedMatrixProbabilities.value = question.value.rows.map(row => row.options.map(option => option.probability))
    }
    probabilityEditMode.value = 'quick'
    isEditingProbability.value = true
  }

  // 处理预设分布应用
  const handleApplyPreset = (type: DistributionType) => {
    if (question.value.scaleOptions) {
      const probabilities = calculatePresetDistribution(type, question.value.scaleOptions.length)
      editedProbabilities.value = probabilities
    }
  }

  // 处理区间设置应用
  const handleApplyRange = () => {
    if (question.value.scaleOptions && selectedRange.value.weight > 0 && selectedRange.value.weight <= 100) {
      const probabilities = calculateRangeDistribution(
        selectedRange.value.start,
        selectedRange.value.end,
        selectedRange.value.weight,
        question.value.scaleOptions.length,
      )
      editedProbabilities.value = probabilities
    }
  }

  // 处理概率更新
  const handleUpdateProbability = (data: { index: number; value: number }) => {
    editedProbabilities.value[data.index] = data.value
  }

  // 矩阵题专用处理函数
  const handleMatrixApplyPreset = (type: DistributionType) => {
    if (!question.value.rows) return

    question.value.rows.forEach((row, rowIndex) => {
      const probabilities = calculatePresetDistribution(type, row.options.length)
      if (!editedMatrixProbabilities.value[rowIndex]) {
        editedMatrixProbabilities.value[rowIndex] = []
      }
      probabilities.forEach((prob, optionIndex) => {
        editedMatrixProbabilities.value[rowIndex][optionIndex] = prob
      })
    })
  }

  const handleMatrixApplyRange = () => {
    if (!question.value.rows || selectedRange.value.weight <= 0 || selectedRange.value.weight > 100) return

    question.value.rows.forEach((row, rowIndex) => {
      const probabilities = calculateRangeDistribution(selectedRange.value.start, selectedRange.value.end, selectedRange.value.weight, row.options.length)
      if (!editedMatrixProbabilities.value[rowIndex]) {
        editedMatrixProbabilities.value[rowIndex] = []
      }
      probabilities.forEach((prob, optionIndex) => {
        editedMatrixProbabilities.value[rowIndex][optionIndex] = prob
      })
    })
  }

  const handleMatrixUpdateProbability = (data: { rowIndex: number; optionIndex: number; value: number }) => {
    if (!editedMatrixProbabilities.value[data.rowIndex]) {
      editedMatrixProbabilities.value[data.rowIndex] = []
    }
    editedMatrixProbabilities.value[data.rowIndex][data.optionIndex] = data.value
  }

  const saveProbability = () => {
    if (question.value.rows) {
      // 矩阵题：验证每行概率总和
      let hasError = false
      for (let rowIndex = 0; rowIndex < question.value.rows.length; rowIndex++) {
        const rowProbabilities = editedMatrixProbabilities.value[rowIndex] || []
        const total = rowProbabilities.reduce((sum, p) => sum + Number(p || 0), 0)
        if (total !== 100) {
          eventBus.emit('showToast', { message: `第${rowIndex + 1}行概率总和必须等于100，当前为${total}`, type: 'warning' })
          hasError = true
          break
        }
      }
      if (hasError) return

      // 保存矩阵题概率
      question.value.rows.forEach((row, rowIndex) => {
        row.options.forEach((option, optionIndex) => {
          option.probability = Number(editedMatrixProbabilities.value[rowIndex]?.[optionIndex] || 0)
        })
      })
      surveyStore.updateQuestionMatrix(question.value.index, question.value.rows)
    } else {
      // 其他题型：验证概率总和
      const total = editedProbabilities.value.reduce((sum, p) => sum + Number(p), 0)
      if (total !== 100) {
        eventBus.emit('showToast', { message: '概率总和必须等于100', type: 'warning' })
        return
      }

      if (question.value.options) {
        question.value.options.forEach((option, idx) => {
          option.probability = Number(editedProbabilities.value[idx])
        })
        surveyStore.updateQuestionOptions(question.value.index, question.value.options)
      } else if (question.value.selectOptions) {
        question.value.selectOptions.forEach((option, idx) => {
          option.probability = Number(editedProbabilities.value[idx])
        })
        surveyStore.updateQuestionSelectOptions(question.value.index, question.value.selectOptions, question.value.selectedValue || '')
      } else if (question.value.scaleOptions) {
        question.value.scaleOptions.forEach((option, idx) => {
          option.probability = Number(editedProbabilities.value[idx])
        })
        surveyStore.updateQuestionScaleOptions(question.value.index, question.value.scaleOptions)
      } else if (question.value.textareaInputs) {
        question.value.textareaInputs.forEach((input, idx) => {
          input.probability = Number(editedProbabilities.value[idx])
        })
        surveyStore.updateQuestionTextareaInputs(question.value.index, question.value.textareaInputs)
      }
    }

    surveyStore.saveData()
    isEditingProbability.value = false
    eventBus.emit('showToast', { message: '概率已保存', type: 'success' })
  }

  const cancelEditProbability = () => {
    isEditingProbability.value = false
  }

  return {
    isEditingProbability,
    editedProbabilities,
    editedMatrixProbabilities,
    probabilityEditMode,
    selectedRange,
    flattenedMatrixOptions,
    startEditProbability,
    handleApplyPreset,
    handleApplyRange,
    handleUpdateProbability,
    handleMatrixApplyPreset,
    handleMatrixApplyRange,
    handleMatrixUpdateProbability,
    saveProbability,
    cancelEditProbability,
  }
}
