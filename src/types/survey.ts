export type QuestionType = 'radio' | 'checkbox' | 'matrix' | 'matrix-multiple' | 'textarea' | 'select' | 'unknown'

export interface Option {
  text: string
  value: string
  isSelected: boolean
  probability: number
}

export interface MatrixRow {
  title: string
  options: Option[]
}

export interface Question {
  index: number
  title: string
  type: QuestionType
  options?: Option[]
  rows?: MatrixRow[]
  headers?: string[]
  textareaValue?: string
  textareaId?: string
  unknownContent?: string
  selectOptions?: Option[] // 用于下拉选择题
  selectedValue?: string // 用于存储选中的值
}
