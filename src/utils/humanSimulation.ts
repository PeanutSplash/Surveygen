/**
 * 模拟人类点击行为
 * @param element - 目标HTML元素
 * @returns Promise<void> - 点击完成后的Promise
 * @description
 * 该函数通过以下步骤模拟真实的人类点击行为：
 * 1. 随机延迟500-1500ms
 * 2. 在元素区域内随机选择点击位置
 * 3. 先触发鼠标移动事件
 * 4. 短暂延迟后触发点击事件
 */
export const simulateHumanClick = (element: HTMLElement) => {
  return new Promise<void>(resolve => {
    const delay = Math.random() * 1000 + 500
    setTimeout(() => {
      const rect = element.getBoundingClientRect()
      const x = rect.left + Math.random() * rect.width
      const y = rect.top + Math.random() * rect.height

      const moveEvent = new MouseEvent('mousemove', {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: x,
        clientY: y,
      })
      element.dispatchEvent(moveEvent)

      setTimeout(
        () => {
          const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window,
            clientX: x,
            clientY: y,
          })
          element.dispatchEvent(clickEvent)
          resolve()
        },
        Math.random() * 200 + 50,
      )
    }, delay)
  })
}

/**
 * 模拟滑块验证码操作
 * @returns Promise<void>
 * @description
 * 该函数模拟完成滑块验证码的完整流程：
 * 1. 等待滑块元素加载
 * 2. 触发鼠标按下事件
 * 3. 模拟鼠标移动（带有随机偏移）
 * 4. 触发鼠标释放事件
 * 5. 验证是否成功，失败则重试
 */
export const simulateSliderVerification = async () => {
  // 等待滑块元素加载
  await new Promise<void>(resolve => {
    const checkSlider = () => {
      const slider = document.querySelector('#nc_1_n1z') as HTMLElement
      if (slider) {
        resolve()
      } else {
        setTimeout(checkSlider, 100)
      }
    }
    checkSlider()
  })

  const slider = document.querySelector('#nc_1_n1z') as HTMLElement
  if (!slider) return

  // 触发鼠标按下事件
  const mouseDownEvent = document.createEvent('MouseEvents')
  mouseDownEvent.initEvent('mousedown', true, false)
  slider.dispatchEvent(mouseDownEvent)

  // 随机延迟300-500ms
  await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200))

  // 触发鼠标移动事件，模拟拖动
  const mouseMoveEvent = document.createEvent('MouseEvents')
  mouseMoveEvent.initEvent('mousemove', true, false)
  Object.defineProperty(mouseMoveEvent, 'clientX', {
    get() {
      return 260 + Math.random() * 10 - 5
    },
  })
  slider.dispatchEvent(mouseMoveEvent)

  // 随机延迟1000-1500ms
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500))

  // 触发鼠标释放事件
  const mouseUpEvent = document.createEvent('MouseEvents')
  mouseUpEvent.initEvent('mouseup', true, false)
  slider.dispatchEvent(mouseUpEvent)

  // 验证是否成功，失败则重试
  const sliderContainer = document.querySelector('#nc_1_n1t') as HTMLElement
  if (sliderContainer && !sliderContainer.classList.contains('nc-bg-success')) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    await simulateSliderVerification()
  }
}
