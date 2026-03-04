/**
 * 随机化相关的工具函数
 */

/**
 * 为选项数组随机分配概率，确保总和为100
 */
export const randomizeOptions = (options: any[]) => {
  const total = options.length
  let remaining = 100
  options.forEach((option, index) => {
    if (index === total - 1) {
      option.probability = remaining
    } else {
      const randomProb = Math.floor(Math.random() * (remaining - (total - index - 1))) + 1
      option.probability = randomProb
      remaining -= randomProb
    }
  })
}

/**
 * 为文本输入数组随机分配概率，确保总和为100
 */
export const randomizeTextareaOptions = (inputs: { value: string; probability?: number }[]) => {
  const total = inputs.length
  let remaining = 100
  inputs.forEach((input, index) => {
    if (index === total - 1) {
      input.probability = remaining
    } else {
      const randomProb = Math.floor(Math.random() * (remaining - (total - index - 1))) + 1
      input.probability = randomProb
      remaining -= randomProb
    }
  })
}

/**
 * 根据概率权重随机选择选项
 * @param options 选项数组，每个选项必须有probability属性
 * @returns 选中的选项，如果没有选项或概率总和为0则返回null
 */
export const selectByProbability = <T extends { probability: number }>(options: T[]): T | null => {
  if (!options || options.length === 0) {
    return null
  }

  // 计算总概率
  const totalProbability = options.reduce((sum, option) => sum + (option.probability || 0), 0)

  if (totalProbability <= 0) {
    return null
  }

  // 生成随机数
  let random = Math.random() * totalProbability

  // 根据概率选择选项
  for (const option of options) {
    if (random < (option.probability || 0)) {
      return option
    }
    random -= (option.probability || 0)
  }

  // 如果由于浮点数精度问题没有选中任何选项，返回最后一个有概率的选项
  return options.find(option => (option.probability || 0) > 0) || null
}

/**
 * 根据概率权重随机选择多个选项（用于多选题）
 * @param options 选项数组，每个选项必须有probability属性
 * @returns 选中的选项数组
 */
export const selectMultipleByProbability = <T extends { probability?: number }>(options: T[]): T[] => {
  if (!options || options.length === 0) {
    return []
  }

  const selectedOptions: T[] = []

  // 对每个选项独立进行概率判断
  options.forEach(option => {
    const probability = (option.probability || 0) / 100 // 将百分比转换为0-1的概率
    if (Math.random() < probability) {
      selectedOptions.push(option)
    }
  })

  return selectedOptions
}
