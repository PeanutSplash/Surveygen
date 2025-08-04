/**
 * 问题类型相关的辅助函数
 */

export const getQuestionTypeLabel = (type: string): string => {
  switch (type) {
    case 'radio':
      return '单选题'
    case 'checkbox':
      return '多选题'
    case 'matrix':
      return '矩阵题'
    case 'matrix-multiple':
      return '矩阵多选题'
    case 'textarea':
      return '文本题'
    case 'select':
      return '下拉选择题'
    case 'scale':
      return '量表题'
    default:
      return '未知题型'
  }
}

export const getQuestionTypeClass = (type: string): string => {
  switch (type) {
    case 'radio':
      return 'bg-blue-50 text-blue-600 border border-blue-200'
    case 'checkbox':
      return 'bg-green-50 text-green-600 border border-green-200'
    case 'matrix':
      return 'bg-purple-50 text-purple-600 border border-purple-200'
    case 'matrix-multiple':
      return 'bg-pink-50 text-pink-600 border border-pink-200'
    case 'textarea':
      return 'bg-yellow-50 text-yellow-600 border border-yellow-200'
    case 'select':
      return 'bg-indigo-50 text-indigo-600 border border-indigo-200'
    case 'scale':
      return 'bg-orange-50 text-orange-600 border border-orange-200'
    default:
      return 'bg-gray-50 text-gray-600 border border-gray-200'
  }
}
