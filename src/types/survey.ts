export type QuestionType = 'radio' | 'checkbox' | 'matrix' | 'matrix-multiple' | 'textarea' | 'select' | 'unknown' | 'scale'

export interface Option {
  text: string
  value: string
  isSelected: boolean
  probability: number
  hasInput?: boolean
  inputValue?: string
}

export interface MatrixRow {
  title: string
  options: Option[]
}

export interface ScaleOption {
  value: number
  label: string
  isSelected: boolean
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
  selectOptions?: Option[]
  selectedValue?: string
  scaleOptions?: ScaleOption[]
  minLabel?: string
  maxLabel?: string
}
