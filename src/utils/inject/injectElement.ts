type InjectConfig = {
  targetId: string
  elementType: string
  attributes: Record<string, string>
  content?: string
  onClick?: () => void
  uniqueId: string
}

export const injectElement = ({ targetId, elementType, attributes, content, onClick, uniqueId }: InjectConfig): boolean => {
  const targetElement = document.getElementById(targetId)
  if (!targetElement) return false

  // 检查元素是否已存在
  const existingElement = document.getElementById(uniqueId)
  if (existingElement) {
    return false
  }

  const newElement = document.createElement(elementType)

  // 设置唯一ID
  newElement.id = uniqueId

  Object.entries(attributes).forEach(([key, value]) => {
    newElement.setAttribute(key, value)
  })

  if (content) {
    newElement.textContent = content
  }

  if (onClick) {
    newElement.onclick = onClick
  }

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
