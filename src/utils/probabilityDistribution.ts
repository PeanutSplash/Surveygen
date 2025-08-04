/**
 * 概率分布计算工具
 * 提供各种概率分布的计算方法
 */

export type DistributionType = 'normal' | 'left-skew' | 'right-skew' | 'uniform'

/**
 * 预设分布计算函数
 * @param type 分布类型
 * @param optionsCount 选项数量
 * @returns 概率数组
 */
export const calculatePresetDistribution = (type: DistributionType, optionsCount: number): number[] => {
  let probabilities: number[] = []

  switch (type) {
    case 'normal': // 正态分布（中间高）
      const middle = Math.floor(optionsCount / 2)
      probabilities = Array.from({ length: optionsCount }, (_, index) => {
        const distance = Math.abs(index - middle)
        const sigma = optionsCount / 6 // Standard deviation ≈ 1/6 of the full range
        const normalValue = Math.exp(-0.5 * Math.pow(distance / sigma, 2))
        return Math.round((normalValue * 100) / optionsCount) // initial weight; will be normalized below
      })
      break

    case 'left-skew': // 左偏分布（低分多）
      probabilities = Array.from({ length: optionsCount }, (_, index) => {
        return Math.max(5, Math.round(40 * Math.exp(-index / (optionsCount / 3))))
      })
      break

    case 'right-skew': // 右偏分布（高分多）
      probabilities = Array.from({ length: optionsCount }, (_, index) => {
        return Math.max(5, Math.round(40 * Math.exp(-(optionsCount - index - 1) / (optionsCount / 3))))
      })
      break

    case 'uniform': // 均匀分布
      const baseProb = Math.floor(100 / optionsCount)
      const remainder = 100 - baseProb * optionsCount
      probabilities = Array.from({ length: optionsCount }, (_, index) => baseProb + (index < remainder ? 1 : 0))
      break
  }

  return normalizeProbabilities(probabilities)
}

/**
 * 区间权重分布计算
 * @param startIndex 起始索引
 * @param endIndex 结束索引
 * @param rangeWeight 区间权重百分比
 * @param optionsCount 总选项数
 * @returns 概率数组
 */
export const calculateRangeDistribution = (startIndex: number, endIndex: number, rangeWeight: number, optionsCount: number): number[] => {
  // Input validation
  if (startIndex < 0 || endIndex >= optionsCount || startIndex > endIndex) {
    throw new Error('Invalid range indices')
  }
  if (rangeWeight < 0 || rangeWeight > 100) {
    throw new Error('Range weight must be between 0 and 100')
  }
  if (optionsCount <= 0) {
    throw new Error('Options count must be positive')
  }

  const probabilities = new Array(optionsCount).fill(0)
  const rangeSize = endIndex - startIndex + 1
  const remainingWeight = 100 - rangeWeight
  const outsideCount = optionsCount - rangeSize

  // 区间内平均分配权重
  const weightPerRange = rangeWeight / rangeSize
  for (let i = startIndex; i <= endIndex; i++) {
    probabilities[i] = Math.round(weightPerRange)
  }

  // 区间外平均分配剩余权重
  if (outsideCount > 0) {
    const weightPerOutside = remainingWeight / outsideCount
    for (let i = 0; i < optionsCount; i++) {
      if (i < startIndex || i > endIndex) {
        probabilities[i] = Math.round(weightPerOutside)
      }
    }
  }

  return normalizeProbabilities(probabilities)
}

/**
 * 标准化概率数组，确保总和为100且没有负数
 * @param probabilities 概率数组
 * @returns 标准化后的概率数组
 */
export const normalizeProbabilities = (probabilities: number[]): number[] => {
  if (probabilities.length === 0) return []

  // 确保所有概率都不是负数
  const nonNegativeProbabilities = probabilities.map(p => Math.max(0, p))

  const total = nonNegativeProbabilities.reduce((sum, p) => sum + p, 0)

  if (total === 0) {
    // 如果所有概率都是0，平均分配
    const averageProb = Math.floor(100 / probabilities.length)
    const remainder = 100 - averageProb * probabilities.length
    return probabilities.map((_, index) => averageProb + (index < remainder ? 1 : 0))
  }

  if (total !== 100) {
    const diff = 100 - total

    if (diff > 0) {
      // 总和小于100，将差值分配给概率最大的元素
      const maxIndex = nonNegativeProbabilities.indexOf(Math.max(...nonNegativeProbabilities))
      nonNegativeProbabilities[maxIndex] += diff
    } else {
      // 总和大于100，按比例缩减所有概率
      const scaleFactor = 100 / total
      for (let i = 0; i < nonNegativeProbabilities.length; i++) {
        nonNegativeProbabilities[i] = Math.round(nonNegativeProbabilities[i] * scaleFactor)
      }

      // 再次检查并调整，确保总和为100
      const newTotal = nonNegativeProbabilities.reduce((sum, p) => sum + p, 0)
      const finalDiff = 100 - newTotal
      if (finalDiff !== 0) {
        // 将剩余差值分配给概率最大的元素
        const maxIndex = nonNegativeProbabilities.indexOf(Math.max(...nonNegativeProbabilities))
        nonNegativeProbabilities[maxIndex] += finalDiff
      }
    }
  }

  // 最后再次确保没有负数（防护措施）
  const result = nonNegativeProbabilities.map(p => Math.max(0, p))

  // 验证总和
  const finalTotal = result.reduce((sum, p) => sum + p, 0)
  if (finalTotal !== 100) {
    console.warn('概率总和不等于100:', finalTotal, result)
  }

  return result
}

/**
 * 验证概率数组是否有效
 * @param probabilities 概率数组
 * @returns 是否有效
 */
export const validateProbabilities = (probabilities: number[]): boolean => {
  const total = probabilities.reduce((sum, p) => sum + Number(p), 0)
  return Math.abs(total - 100) < 0.01 // 允许微小的浮点误差
}
