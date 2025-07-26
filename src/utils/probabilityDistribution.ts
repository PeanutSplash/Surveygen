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
        const maxDistance = Math.max(middle, optionsCount - middle - 1)
        return Math.max(5, Math.round(30 * Math.exp(-Math.pow(distance / (maxDistance / 2), 2))))
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
      probabilities = Array.from({ length: optionsCount }, (_, index) => 
        baseProb + (index < remainder ? 1 : 0)
      )
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
export const calculateRangeDistribution = (
  startIndex: number, 
  endIndex: number, 
  rangeWeight: number, 
  optionsCount: number
): number[] => {
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
 * 标准化概率数组，确保总和为100
 * @param probabilities 概率数组
 * @returns 标准化后的概率数组
 */
export const normalizeProbabilities = (probabilities: number[]): number[] => {
  const total = probabilities.reduce((sum, p) => sum + p, 0)
  if (total !== 100) {
    const diff = 100 - total
    probabilities[probabilities.length - 1] += diff
  }
  return probabilities
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