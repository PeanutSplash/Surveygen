import { injectElement } from './injectElement'
import { useSurveyStore } from '../../stores/surveyStore'
import eventBus from '../eventBus'

export const injectResetSurveyButton = () => {
  const surveyStore = useSurveyStore()

  injectElement({
    targetId: 'submit_div',
    elementType: 'button',
    uniqueId: 'reset-survey-button',
    attributes: {
      class: `
        px-4 py-2 mr-2
        bg-indigo-600
        text-white text-sm font-medium
        rounded-md
        shadow-sm
        hover:bg-indigo-700
        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
        transition duration-150 ease-in-out
      `,
    },
    content: '提交为标准答案',
    onClick: () => {
      surveyStore.resetSurvey()
      eventBus.emit('showToast', {
        message: '已解析为标准答案',
        type: 'success',
      })
    },
  })
}
