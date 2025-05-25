/**
 * 注入元素的配置接口
 * @interface InjectConfig
 * @property {string} targetId - 目标元素的ID
 * @property {string} elementType - 要创建的元素类型
 * @property {Record<string, string>} attributes - 元素的属性键值对
 * @property {string} [content] - 元素的文本内容（可选）
 * @property {() => void} [onClick] - 点击事件处理函数（可选）
 * @property {string} uniqueId - 元素的唯一标识符
 */
type InjectConfig = {
  targetId: string
  elementType: string
  attributes: Record<string, string>
  content?: string
  onClick?: () => void
  uniqueId: string
}

/**
 * 向指定目标元素注入新元素
 *
 * @param {InjectConfig} config - 注入配置对象
 * @returns {boolean} 注入是否成功
 *
 * @description
 * 该函数用于在指定的目标元素中注入一个新的DOM元素。它会：
 * 1. 检查目标元素是否存在
 * 2. 验证是否已存在相同ID的元素
 * 3. 创建新元素并设置其属性和事件
 * 4. 将新元素插入到提交表格的第一个单元格中
 *
 * ```
 */
export const injectElement = ({ targetId, elementType, attributes, content, onClick, uniqueId }: InjectConfig): boolean => {
  // 获取目标元素
  const targetElement = document.getElementById(targetId)
  if (!targetElement) return false

  // 检查是否已存在相同ID的元素
  const existingElement = document.getElementById(uniqueId)
  if (existingElement) {
    return false
  }

  // 创建新元素
  const newElement = document.createElement(elementType)
  newElement.id = uniqueId

  // 设置元素属性
  Object.entries(attributes).forEach(([key, value]) => {
    newElement.setAttribute(key, value)
  })

  // 设置元素内容
  if (content) {
    newElement.textContent = content
  }

  // 绑定点击事件
  if (onClick) {
    newElement.onclick = onClick
  }

  // 查找提交表格并插入新元素
  const submitTable = targetElement.querySelector('#submit_table')
  if (submitTable) {
    const firstTd = submitTable.querySelector('td')
    if (firstTd) {
      firstTd.insertBefore(newElement, firstTd.firstChild)
      return true
    }
  }

  return false
}
