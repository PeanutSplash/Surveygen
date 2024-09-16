export interface Option {
  value: string
  text: string
  isSelected: boolean
  probability: number // 新增概率字段
}

export interface Question {
  index: number
  title: string
  type: string
  options?: Option[]
  headers?: string[]
  rows?: Array<{ title: string; options: Array<Option> }>
  isMultiSelect?: boolean
  textareaValue?: string
  textareaId?: string
  unknownContent?: string
}

export function parseSurvey(): Question[] {
  const surveyContent = document.getElementById('ctl00_ContentPlaceHolder1_JQ1_surveyContent')
  if (!surveyContent) return []

  const questions = surveyContent.querySelectorAll('.div_question')
  return Array.from(questions).map((question, index) => {
    const questionTitle = question.querySelector('.div_title_question')?.textContent || ''
    const questionType = getQuestionType(question)

    let parsedQuestion: Partial<Question> = { type: questionType }
    switch (questionType) {
      case 'radio':
        parsedQuestion = { ...parsedQuestion, ...parseRadioQuestion(question) }
        break
      case 'checkbox':
        parsedQuestion = { ...parsedQuestion, ...parseCheckboxQuestion(question) }
        break
      case 'matrix':
        parsedQuestion = { ...parsedQuestion, ...parseMatrixQuestion(question) }
        break
      case 'textarea':
        parsedQuestion = { ...parsedQuestion, ...parseTextAreaQuestion(question) }
        break
      default:
        parsedQuestion = {
          ...parsedQuestion,
          unknownContent: question.innerHTML,
        }
    }

    return {
      index: index + 1,
      title: questionTitle,
      ...parsedQuestion,
    } as Question
  })
}

function getQuestionType(questionElement: Element): string {
  if (questionElement.querySelector('.ulradiocheck')) {
    const isMultiSelect = questionElement.querySelector('.jqCheckbox') !== null
    return isMultiSelect ? 'checkbox' : 'radio'
  } else if (questionElement.querySelector('table')) {
    return 'matrix'
  } else if (questionElement.querySelector('textarea')) {
    return 'textarea'
  }
  return 'unknown'
}

function parseRadioQuestion(questionElement: Element) {
  const options = questionElement.querySelectorAll('.ulradiocheck li')
  const parsedOptions = Array.from(options).map(option => {
    const input = option.querySelector('input')
    const label = option.querySelector('label')
    const isChecked = option.querySelector('.jqRadio.jqChecked') !== null
    return {
      value: input?.value || '',
      text: label?.textContent || '',
      isSelected: isChecked,
      probability: 0, // 初始化为0，稍后会更新
    }
  })

  // 更新概率
  updateOptionProbabilities(parsedOptions)

  return {
    options: parsedOptions,
  }
}

function parseCheckboxQuestion(questionElement: Element) {
  const options = questionElement.querySelectorAll('.ulradiocheck li')
  const parsedOptions = Array.from(options).map(option => {
    const input = option.querySelector('input')
    const label = option.querySelector('label')
    const isChecked = option.querySelector('.jqCheckbox.jqChecked') !== null
    return {
      value: input?.value || '',
      text: label?.textContent || '',
      isSelected: isChecked,
      probability: 0, // 初始化为0，稍后会更新
    }
  })

  // 更新概率
  updateOptionProbabilities(parsedOptions)

  return {
    options: parsedOptions,
    isMultiSelect: true,
  }
}

function parseTextAreaQuestion(questionElement: Element) {
  const textarea = questionElement.querySelector('textarea') as HTMLTextAreaElement
  return {
    textareaValue: textarea?.value || '',
    textareaId: textarea?.id || '',
  }
}

function parseMatrixQuestion(questionElement: Element) {
  const table = questionElement.querySelector('table')
  if (!table) return { headers: [], rows: [] }

  const headers = Array.from(table.querySelectorAll('thead td')).map(td => td.textContent || '')
  const rows = table.querySelectorAll('tbody tr')

  const parsedRows = Array.from(rows).map(row => {
    const rowTitle = row.querySelector('th')?.textContent || ''
    const rowOptions = Array.from(row.querySelectorAll('td')).map(td => {
      const input = td.querySelector('input') as HTMLInputElement
      const isChecked = td.querySelector('.jqRadio.jqChecked') !== null
      return {
        value: input?.value || '',
        text: input?.value || '', // 添加 text 属性
        isSelected: isChecked,
        probability: isChecked ? 80 : 0, // 设置选中选项的概率为80%
      }
    })

    // 计算未选中选项的概率
    const unselectedOptions = rowOptions.filter(option => !option.isSelected)
    const remainingProbability = unselectedOptions.length > 0 ? 20 / unselectedOptions.length : 0
    unselectedOptions.forEach(option => {
      option.probability = remainingProbability
    })

    return {
      title: rowTitle,
      options: rowOptions,
    }
  })

  return {
    headers: headers,
    rows: parsedRows,
  }
}

function updateOptionProbabilities(options: Option[]) {
  const selectedOptions = options.filter(option => option.isSelected)
  const unselectedOptions = options.filter(option => !option.isSelected)

  if (selectedOptions.length > 0) {
    // 为选中的选项分配80%的概率
    const probabilityPerSelected = Math.floor(80 / selectedOptions.length)
    let remainingSelectedProbability = 80 - probabilityPerSelected * selectedOptions.length

    selectedOptions.forEach((option, index) => {
      option.probability = probabilityPerSelected
      if (index < remainingSelectedProbability) {
        option.probability += 1
      }
    })

    // 为未选中的选项分配剩余的20%概率
    if (unselectedOptions.length > 0) {
      const probabilityPerUnselected = Math.floor(20 / unselectedOptions.length)
      let remainingUnselectedProbability = 20 - probabilityPerUnselected * unselectedOptions.length

      unselectedOptions.forEach((option, index) => {
        option.probability = probabilityPerUnselected
        if (index < remainingUnselectedProbability) {
          option.probability += 1
        }
      })
    }
  } else {
    // 如果没有选中的选项，平均分配100%的概率
    const probabilityPerOption = Math.floor(100 / options.length)
    let remainingProbability = 100 - probabilityPerOption * options.length

    options.forEach((option, index) => {
      option.probability = probabilityPerOption
      if (index < remainingProbability) {
        option.probability += 1
      }
    })
  }

  // 最后检查并确保总和为100
  const totalProbability = options.reduce((sum, option) => sum + option.probability, 0)
  if (totalProbability !== 100) {
    const diff = 100 - totalProbability
    options[options.length - 1].probability += diff
  }
}
