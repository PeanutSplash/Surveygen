// 模拟人类行为的点击
export const simulateHumanClick = (element: HTMLElement) => {
  return new Promise<void>((resolve) => {
    // 随机延迟 500-1500 毫秒
    const delay = Math.random() * 1000 + 500;
    setTimeout(() => {
      // 创建并分发鼠标事件
      const rect = element.getBoundingClientRect();
      const x = rect.left + Math.random() * rect.width;
      const y = rect.top + Math.random() * rect.height;

      // 模拟鼠标移动
      const moveEvent = new MouseEvent('mousemove', {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: x,
        clientY: y
      });
      element.dispatchEvent(moveEvent);

      // 短暂延迟后模拟点击
      setTimeout(() => {
        const clickEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window,
          clientX: x,
          clientY: y
        });
        element.dispatchEvent(clickEvent);
        resolve();
      }, Math.random() * 200 + 50);
    }, delay);
  });
};

// 模拟滑块验证
export const simulateSliderVerification = async () => {
  // 等待滑块元素出现
  await new Promise<void>(resolve => {
    const checkSlider = () => {
      const slider = document.querySelector('#nc_1_n1z') as HTMLElement;
      if (slider) {
        resolve();
      } else {
        setTimeout(checkSlider, 100);
      }
    };
    checkSlider();
  });

  const slider = document.querySelector('#nc_1_n1z') as HTMLElement;
  if (!slider) return;

  // 模拟鼠标按下
  const mouseDownEvent = document.createEvent('MouseEvents');
  mouseDownEvent.initEvent('mousedown', true, false);
  slider.dispatchEvent(mouseDownEvent);

  // 短暂延迟，模拟人类反应时间
  await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));

  // 模拟鼠标移动
  const mouseMoveEvent = document.createEvent('MouseEvents');
  mouseMoveEvent.initEvent('mousemove', true, false);
  Object.defineProperty(mouseMoveEvent, 'clientX', {
    get() {
      // 添加一些随机性，使滑动看起来更自然
      return 260 + Math.random() * 10 - 5;
    }
  });
  slider.dispatchEvent(mouseMoveEvent);

  // 短暂延迟，模拟滑动时间
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500));

  // 模拟鼠标松开
  const mouseUpEvent = document.createEvent('MouseEvents');
  mouseUpEvent.initEvent('mouseup', true, false);
  slider.dispatchEvent(mouseUpEvent);

  // 检查滑块验证是否成功
  const sliderContainer = document.querySelector('#nc_1_n1t') as HTMLElement;
  if (sliderContainer && !sliderContainer.classList.contains('nc-bg-success')) {
    // 如果验证失败，重新尝试
    await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒后重试
    await simulateSliderVerification();
  }
};