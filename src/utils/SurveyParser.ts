import { QuestionType, Option, MatrixRow, Question, ScaleOption } from '../types/survey'

// 解析调查问卷，返回问题数组
export const parseSurvey = (): Question[] => {
  const surveyContent = document.getElementById('ctl00_ContentPlaceHolder1_JQ1_surveyContent')
  if (!surveyContent) return []

  const questions = surveyContent.querySelectorAll('.div_question')
  return Array.from(questions).map((question, index) => {
    const questionTitle = question.querySelector('.div_title_question')?.textContent || ''
    const questionType = determineQuestionType(question) as QuestionType

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
      case 'matrix-multiple':
        parsedQuestion = { ...parsedQuestion, ...parseMatrixCheckboxQuestion(question) }
        break
      case 'textarea':
        parsedQuestion = { ...parsedQuestion, ...parseTextAreaQuestion(question) }
        break
      case 'select':
        parsedQuestion = { ...parsedQuestion, ...parseSelectQuestion(question) }
        break
      case 'scale':
        parsedQuestion = { ...parsedQuestion, ...parseScaleQuestion(question) }
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

// 确定问题类型
const determineQuestionType = (questionElement: Element): QuestionType => {
  if (questionElement.querySelector('.ulradiocheck')) {
    const isMultiSelect = questionElement.querySelector('.jqCheckbox') !== null
    return isMultiSelect ? 'checkbox' : 'radio'
  } else if (questionElement.querySelector('table')) {
    const isMatrixMultiSelect = questionElement.querySelector('table .jqCheckbox') !== null
    return isMatrixMultiSelect ? 'matrix-multiple' : 'matrix'
  } else if (questionElement.querySelector('textarea')) {
    return 'textarea'
  } else if (questionElement.querySelector('select')) {
    return 'select'
  } else if (questionElement.querySelector('.div_table_radio_question')) {
    return 'scale'
  }
  return 'unknown'
}

// 解析单选题
const parseRadioQuestion = (questionElement: Element) => {
  const options = questionElement.querySelectorAll('.ulradiocheck li')
  const parsedOptions = Array.from(options).map(option => {
    const input = option.querySelector('input[type="radio"]') as HTMLInputElement | null
    const label = option.querySelector('label')
    const isChecked = option.querySelector('.jqRadio.jqChecked') !== null
    const textInputs = option.querySelectorAll('input[type="text"]') as NodeListOf<HTMLInputElement>
    return {
      value: input?.value || '',
      text: label?.textContent?.trim() || '',
      isSelected: isChecked,
      probability: 0,
      hasInput: textInputs.length > 0,
      inputs: Array.from(textInputs).map(textInput => ({ value: textInput.value })),
    }
  })

  updateOptionProbabilities(parsedOptions)

  return {
    options: parsedOptions,
  }
}

// 解析多选题
const parseCheckboxQuestion = (questionElement: Element) => {
  const options = questionElement.querySelectorAll('.ulradiocheck li')
  const parsedOptions = Array.from(options).map(option => {
    const input = option.querySelector('input[type="checkbox"]') as HTMLInputElement | null
    const label = option.querySelector('label')
    const isChecked = option.querySelector('.jqCheckbox.jqChecked') !== null
    const textInputs = option.querySelectorAll('input[type="text"]') as NodeListOf<HTMLInputElement>
    return {
      value: input?.value || '',
      text: label?.textContent?.trim() || '',
      isSelected: isChecked,
      probability: 0,
      hasInput: textInputs.length > 0,
      inputs: Array.from(textInputs).map(textInput => ({ value: textInput.value })),
    }
  })

  updateOptionProbabilities(parsedOptions)

  return {
    options: parsedOptions,
    isMultiSelect: true,
  }
}

// 解析矩阵多选题
const parseMatrixCheckboxQuestion = (questionElement: Element) => {
  const table = questionElement.querySelector('table')
  if (!table) return { headers: [], rows: [] }

  const headers = Array.from(table.querySelectorAll('thead td')).map(td => td.textContent || '')
  const rows = table.querySelectorAll('tbody tr')

  const parsedRows = Array.from(rows).map(row => {
    const rowTitle = row.querySelector('th')?.textContent || ''
    const rowOptions = Array.from(row.querySelectorAll('td')).map(td => {
      const input = td.querySelector('input') as HTMLInputElement
      const isChecked = td.querySelector('.jqCheckbox.jqChecked') !== null
      return {
        value: input?.value || '',
        text: input?.value || '',
        isSelected: isChecked,
        probability: isChecked ? 80 : 0,
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
    isMultiSelect: true,
  }
}

// 解析文本区域题
const parseTextAreaQuestion = (questionElement: Element) => {
  const textarea = questionElement.querySelector('textarea') as HTMLTextAreaElement
  const textareaValue = textarea?.value || ''
  return {
    textareaValue,
    textareaId: textarea?.id || '',
    textareaInputs: [{ value: textareaValue }],
  }
}

// 解析矩阵题
const parseMatrixQuestion = (questionElement: Element) => {
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
        text: input?.value || '',
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

// 解析量表题
const parseScaleQuestion = (questionElement: Element) => {
  const scaleOptions: ScaleOption[] = []
  const allLiElements = questionElement.querySelectorAll('.div_table_radio_question li')
  const liElements = Array.from(allLiElements)

  // 获取最小值和最大值标签
  const minLabel = liElements[0].querySelector('b')?.textContent?.trim() || ''
  const maxLabel = liElements[liElements.length - 1].querySelector('b')?.textContent?.trim() || ''

  // 找到最后一个被选中的选项的索引
  const lastSelectedIndex = liElements.slice(1, -1).findLastIndex(li => Array.from(li.classList).some(className => className.includes('on')))

  // 解析中间的选项
  liElements.slice(1, -1).forEach((li, index) => {
    const value = parseInt(li.getAttribute('value') || '0', 10)
    const label = li.getAttribute('title') || `${index + 1}`
    const isSelected = index === lastSelectedIndex
    scaleOptions.push({ value, label, isSelected })
  })

  return {
    scaleOptions,
    minLabel,
    maxLabel,
  }
}

// 修改 parseSelectQuestion 函数
const parseSelectQuestion = (questionElement: Element) => {
  const select = questionElement.querySelector('select') as HTMLSelectElement
  if (!select) return { selectOptions: [] }

  const options = Array.from(select.querySelectorAll('option')).map(option => ({
    value: option.value,
    text: option.textContent || '',
    isSelected: option.selected,
    probability: option.selected ? 100 : 0,
  }))

  return {
    selectOptions: options,
    selectedValue: select.value,
  }
}

// 更新选项概率
const updateOptionProbabilities = (options: Option[]) => {
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