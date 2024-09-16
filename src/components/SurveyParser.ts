export interface Question {
  index: number;
  title: string;
  type: string;
  options?: Array<{ value: string; text: string; isSelected: boolean }>;
  headers?: string[];
  rows?: Array<{ title: string; options: Array<{ value: string; isSelected: boolean }> }>;
  isMultiSelect?: boolean;
  textareaValue?: string;
  textareaId?: string;
  unknownContent?: string; // 添加这一行来存储未知题型的原始内容
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
          unknownContent: question.innerHTML 
        }
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
    const isMultiSelect = questionElement.querySelector('.jqCheckbox') !== null;
    return isMultiSelect ? 'checkbox' : 'radio';
  } else if (questionElement.querySelector('table')) {
    return 'matrix';
  } else if (questionElement.querySelector('textarea')) {
    return 'textarea';
  }
  return 'unknown';
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

function parseCheckboxQuestion(questionElement: Element) {
  const options = questionElement.querySelectorAll('.ulradiocheck li');
  const parsedOptions = Array.from(options).map(option => {
    const input = option.querySelector('input');
    const label = option.querySelector('label');
    const isChecked = option.querySelector('.jqCheckbox.jqChecked') !== null;
    return {
      value: input?.value || '',
      text: label?.textContent || '',
      isSelected: isChecked
    };
  });
  
  return {
    options: parsedOptions,
    isMultiSelect: true
  };
}

function parseTextAreaQuestion(questionElement: Element) {
  const textarea = questionElement.querySelector('textarea') as HTMLTextAreaElement;
  return {
    textareaValue: textarea?.value || '',
    textareaId: textarea?.id || ''
  };
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