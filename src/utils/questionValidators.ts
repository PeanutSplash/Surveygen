/**
 * 问题验证相关的工具函数
 */
import type { Question } from '../types/survey'

/**
 * 判断是否应该显示随机按钮
 */
export const shouldShowRandomButton = (question: Question): boolean => {
  if (question.type === 'radio' || question.type === 'checkbox') {
    return (question.options?.length || 0) > 1
  } else if (question.type === 'matrix' || question.type === 'matrix-multiple') {
    return (question.rows?.length || 0) > 0 && (question.rows?.[0]?.options?.length || 0) > 1
  } else if (question.type === 'select') {
    return (question.selectOptions?.length || 0) > 1
  } else if (question.type === 'scale') {
    return (question.scaleOptions?.length || 0) > 1
  } else if (question.type === 'textarea') {
    return (question.textareaInputs?.length || 0) > 1
  }
  return true
}

/**
 * 判断是否应该显示编辑概率按钮
 */
export const shouldShowEditProbabilityButton = (question: Question): boolean => {
  if (question.type === 'radio' || question.type === 'checkbox') {
    return (question.options?.length || 0) > 1
  } else if (question.type === 'matrix' || question.type === 'matrix-multiple') {
    return (question.rows?.length || 0) > 0 && (question.rows?.[0]?.options?.length || 0) > 1
  } else if (question.type === 'select') {
    return (question.selectOptions?.length || 0) > 1
  } else if (question.type === 'scale') {
    return (question.scaleOptions?.length || 0) > 1
  } else if (question.type === 'textarea') {
    return (question.textareaInputs?.length || 0) > 1
  }
  return true
}

/**
 * 检查问题是否有输入选项
 */
export const hasInputOptions = (question: Question): boolean => {
  return question.options?.some(option => option.hasInput) || false
}
