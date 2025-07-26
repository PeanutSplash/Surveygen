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
