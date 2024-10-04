export type QuestionType = 'radio' | 'checkbox' | 'matrix' | 'matrix-multiple' | 'textarea' | 'unknown'

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
}
