/**
 * 问题交互处理相关的 composable
 */
import { ref, computed, type Ref } from 'vue'
import type { Question, MatrixRow, Option, ScaleOption } from '../types/survey'
import { useSurveyStore } from '../stores/surveyStore'

export const useQuestionHandlers = (question: Ref<Question>) => {
  const surveyStore = useSurveyStore()

  const selectedScaleValue = ref(0)

  const selectedValue = computed({
    get: () => question.value.selectedValue || '',
    set: (value: string) => {
      handleSelectChange(value)
    },
  })

  const handleOptionClick = (optionText: string) => {
    if (surveyStore.isAdvancedMode) return
    if (question.value.type === 'radio') {
      // 单选逻辑
      question.value.options?.forEach(option => {
        option.isSelected = option.text === optionText
        if (option.hasInput) {
          if (!option.isSelected) {
            option.inputs = [{ value: '' }] // 重置未选中选项的输入值
          } else if (!option.inputs || option.inputs.length === 0) {
            option.inputs = [{ value: '' }] // 为新选中的选项初始化输入数组
          }
        }
      })
    } else if (question.value.type === 'checkbox') {
      // 多选题逻辑
      const option = question.value.options?.find(o => o.text === optionText)
      if (option) {
        option.isSelected = !option.isSelected
        if (option.hasInput) {
          if (!option.isSelected) {
            option.inputs = [{ value: '' }] // 重置未选中选项的输入值
          } else if (!option.inputs || option.inputs.length === 0) {
            option.inputs = [{ value: '' }] // 为新选中的选项初始化输入数组
          }
        }
      }
    }

    // 更新问题选项
    surveyStore.updateQuestionOptions(question.value.index, question.value.options || [])
  }

  const handleMatrixOptionClick = (row: MatrixRow, clickedOption: Option) => {
    if (surveyStore.isAdvancedMode) return
    if (question.value.type === 'matrix') {
      // 单选逻辑
      row.options.forEach((option: Option) => {
        option.isSelected = option === clickedOption
      })
    } else if (question.value.type === 'matrix-multiple') {
      // 多选逻辑
      clickedOption.isSelected = !clickedOption.isSelected
    }
    if (question.value.rows) {
      surveyStore.updateQuestionMatrix(question.value.index, question.value.rows)
    }
  }

  const handleSelectChange = (value: string) => {
    if (question.value.selectOptions) {
      question.value.selectOptions.forEach(option => {
        option.isSelected = option.value === value
        option.probability = option.isSelected ? 100 : 0
      })
      // 更新当前问题的数据
      surveyStore.updateQuestionSelectOptions(question.value.index, question.value.selectOptions, value)
    }
  }

  const handleScaleOptionClick = (clickedOption: ScaleOption) => {
    if (surveyStore.isAdvancedMode) return
    if (question.value.type === 'scale' && question.value.scaleOptions) {
      selectedScaleValue.value = clickedOption.value
      question.value.scaleOptions.forEach(option => {
        option.isSelected = option.value === clickedOption.value
      })
      surveyStore.updateQuestionScaleOptions(question.value.index, question.value.scaleOptions)
    }
  }

  const updateTextareaValue = () => {
    if (surveyStore.isAdvancedMode) {
      if (question.value.textareaInputs) {
        surveyStore.updateQuestionTextareaInputs(question.value.index, question.value.textareaInputs)
      }
    } else {
      surveyStore.updateQuestionTextarea(question.value.index, question.value.textareaValue || '')
    }
  }

  const updateOptionInput = (optionIndex: number, inputIndex: number, event: Event) => {
    const inputValue = (event.target as HTMLInputElement).value
    if (
      question.value.options &&
      optionIndex < question.value.options.length &&
      question.value.options[optionIndex].inputs &&
      inputIndex < question.value.options[optionIndex].inputs!.length
    ) {
      question.value.options[optionIndex].inputs![inputIndex].value = inputValue
      surveyStore.updateQuestionOptions(question.value.index, question.value.options)
    }
  }

  const addInput = (option: Option) => {
    if (!surveyStore.isAdvancedMode) return // 在普通模式下禁止添加输入框
    if (!option.inputs) {
      option.inputs = []
    }
    option.inputs.push({ value: '' })
    surveyStore.updateQuestionOptions(question.value.index, question.value.options || [])
  }

  const removeInput = (option: Option) => {
    if ((option.inputs?.length ?? 0) > 1) {
      option.inputs?.pop()
      surveyStore.updateQuestionOptions(question.value.index, question.value.options || [])
    }
  }

  const addTextareaInput = () => {
    if (!question.value.textareaInputs) {
      question.value.textareaInputs = [{ value: '', probability: 100 }]
    } else {
      question.value.textareaInputs.push({ value: '', probability: 0 })
    }
    surveyStore.updateQuestionTextareaInputs(question.value.index, question.value.textareaInputs)
  }

  const removeTextareaInput = (index: number) => {
    if (question.value.textareaInputs && question.value.textareaInputs.length > 1) {
      question.value.textareaInputs.splice(index, 1)
      surveyStore.updateQuestionTextareaInputs(question.value.index, question.value.textareaInputs)
    }
  }

  const fillQuickText = (text: string) => {
    if (surveyStore.isAdvancedMode) {
      // 高级模式：填入到 textareaInputs
      if (question.value.textareaInputs && question.value.textareaInputs.length > 0) {
        // 填入到第一个空白输入框或最后一个输入框
        const emptyInput = question.value.textareaInputs.find(input => !input.value.trim())
        if (emptyInput) {
          emptyInput.value = text
        } else {
          question.value.textareaInputs[question.value.textareaInputs.length - 1].value = text
        }
      }
    } else {
      // 非高级模式：直接设置 textareaValue
      question.value.textareaValue = text
    }
    updateTextareaValue()
  }

  return {
    selectedScaleValue,
    selectedValue,
    handleOptionClick,
    handleMatrixOptionClick,
    handleSelectChange,
    handleScaleOptionClick,
    updateTextareaValue,
    updateOptionInput,
    addInput,
    removeInput,
    addTextareaInput,
    removeTextareaInput,
    fillQuickText,
  }
}
