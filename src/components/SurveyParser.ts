export interface Question {
  index: number;
  title: string;
  type: string;
  options?: Array<{ value: string; text: string; isSelected: boolean }>;
  headers?: string[];
  rows?: Array<{ title: string; options: Array<{ value: string; isSelected: boolean }> }>;
}

export function parseSurvey(): Question[] {
  const surveyContent = document.getElementById('ctl00_ContentPlaceHolder1_JQ1_surveyContent')
  if (!surveyContent) return []

  const questions = surveyContent.querySelectorAll('.div_question')
  return Array.from(questions).map((question, index) => {
    const questionTitle = question.querySelector('.div_title_question')?.textContent || ''
    const questionType = getQuestionType(question)
    
    let parsedQuestion: Partial<Question> = { type: questionType }
    switch(questionType) {
      case 'radio':
        parsedQuestion = { ...parsedQuestion, ...parseRadioQuestion(question) }
        break
      case 'matrix':
        parsedQuestion = { ...parsedQuestion, ...parseMatrixQuestion(question) }
        break
      // 可以根据需要添加更多题型
    }

    return {
      index: index + 1,
      title: questionTitle,
      ...parsedQuestion
    } as Question
  })
}

function getQuestionType(questionElement: Element): string {
  if (questionElement.querySelector('.ulradiocheck')) {
    return 'radio'
  } else if (questionElement.querySelector('table')) {
    return 'matrix'
  }
  // 可以根据需要添加更多题型判断
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
      isSelected: isChecked
    }
  })
  
  return {
    options: parsedOptions
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
        isSelected: isChecked
      }
    })
    return {
      title: rowTitle,
      options: rowOptions
    }
  })
  
  return {
    headers: headers,
    rows: parsedRows
  }
}