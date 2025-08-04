/**
 * 概率样式计算相关的工具函数
 */
import type { ScaleOption, Option, MatrixRow } from '../types/survey'

/**
 * 根据概率计算颜色样式（量表题）
 */
export const calculateProbabilityStyle = (
  option: ScaleOption,
  isEditingProbability: boolean,
  probabilityEditMode: 'quick' | 'range' | 'manual',
  editedProbabilities: number[],
  scaleOptions: ScaleOption[] | undefined,
  isAdvancedMode: boolean,
): Record<string, string> => {
  if (!isAdvancedMode) {
    return {
      backgroundColor: '',
      color: '',
    }
  }

  // 获取当前概率值：编辑模式下且非精确调整时使用编辑中的值
  let probability = option.probability || 0
  if (isEditingProbability && probabilityEditMode !== 'manual') {
    const optionIndex = scaleOptions?.findIndex(o => o.value === option.value) ?? -1
    if (optionIndex >= 0 && editedProbabilities[optionIndex] !== undefined) {
      probability = editedProbabilities[optionIndex]
    }
  }

  // 获取最大概率用于计算相对强度
  let maxProbability: number
  if (isEditingProbability && probabilityEditMode !== 'manual') {
    const valid = editedProbabilities.filter(p => p !== undefined && p !== null) as number[]
    maxProbability = valid.length ? Math.max(...valid) : 0
  } else {
    maxProbability = Math.max(...(scaleOptions?.map(o => o.probability || 0) || [0]))
  }
  if (probability === 0) {
    return {
      backgroundColor: '#f3f4f6', // gray-100
      color: '#6b7280', // gray-500
    }
  }

  // 根据概率计算颜色强度
  const intensity = maxProbability > 0 ? probability / maxProbability : 0

  // 使用蓝色渐变，从浅到深
  if (intensity >= 0.8) {
    return {
      backgroundColor: '#1d4ed8', // blue-700
      color: '#ffffff',
    }
  } else if (intensity >= 0.6) {
    return {
      backgroundColor: '#2563eb', // blue-600
      color: '#ffffff',
    }
  } else if (intensity >= 0.4) {
    return {
      backgroundColor: '#3b82f6', // blue-500
      color: '#ffffff',
    }
  } else if (intensity >= 0.2) {
    return {
      backgroundColor: '#60a5fa', // blue-400
      color: '#ffffff',
    }
  } else {
    return {
      backgroundColor: '#93c5fd', // blue-300
      color: '#1e40af', // blue-800
    }
  }
}

/**
 * 为矩阵题选项计算颜色样式（按行独立计算）
 */
export const calculateMatrixProbabilityStyle = (
  row: MatrixRow,
  option: Option,
  rows: MatrixRow[] | undefined,
  isEditingProbability: boolean,
  probabilityEditMode: 'quick' | 'range' | 'manual',
  editedMatrixProbabilities: number[][],
  isAdvancedMode: boolean,
): Record<string, string> => {
  if (!isAdvancedMode) {
    return {
      backgroundColor: '',
      color: '',
    }
  }

  if (!rows) {
    return { backgroundColor: '', color: '' }
  }

  const rowIndex = rows.findIndex(r => r.title === row.title)
  const optionIndex = row.options.findIndex(o => o === option)

  // 获取当前概率值：编辑模式下且非精确调整时使用编辑中的值
  let probability = option.probability || 0
  if (isEditingProbability && probabilityEditMode !== 'manual') {
    const editedRowProbabilities = editedMatrixProbabilities[rowIndex]
    if (editedRowProbabilities && editedRowProbabilities[optionIndex] !== undefined) {
      probability = editedRowProbabilities[optionIndex]
    }
  }

  // 获取该行内的最大概率用于计算相对强度
  let maxProbabilityInRow: number
  if (isEditingProbability && probabilityEditMode !== 'manual') {
    const editedRowProbabilities = editedMatrixProbabilities[rowIndex] || []
    const valid = editedRowProbabilities.filter(p => p !== undefined && p !== null) as number[]
    maxProbabilityInRow = valid.length ? Math.max(...valid) : 0
  } else {
    maxProbabilityInRow = Math.max(...row.options.map(o => o.probability || 0))
  }

  if (probability === 0) {
    return {
      backgroundColor: '#f3f4f6', // gray-100
      color: '#6b7280', // gray-500
    }
  }

  // 根据该行内的最大概率计算颜色强度
  const intensity = maxProbabilityInRow > 0 ? probability / maxProbabilityInRow : 0

  // 使用绿色渐变，从浅到深
  if (intensity >= 0.8) {
    return {
      backgroundColor: '#15803d', // green-700
      color: '#ffffff',
    }
  } else if (intensity >= 0.6) {
    return {
      backgroundColor: '#16a34a', // green-600
      color: '#ffffff',
    }
  } else if (intensity >= 0.4) {
    return {
      backgroundColor: '#22c55e', // green-500
      color: '#ffffff',
    }
  } else if (intensity >= 0.2) {
    return {
      backgroundColor: '#4ade80', // green-400
      color: '#ffffff',
    }
  } else {
    return {
      backgroundColor: '#86efac', // green-300
      color: '#166534', // green-800
    }
  }
}
