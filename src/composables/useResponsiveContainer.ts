import { ref, computed, onMounted, onUnmounted, type Ref } from 'vue'

/**
 * 响应式容器宽度检测 composable
 * 监听浮动窗口容器的宽度变化，提供响应式布局能力
 */
export function useResponsiveContainer(elementRef: Ref<HTMLElement | null>) {
  const containerWidth = ref(400) // 默认宽度
  let resizeObserver: ResizeObserver | null = null

  /**
   * 更新容器宽度
   */
  const updateContainerWidth = (width: number) => {
    containerWidth.value = width
  }

  /**
   * 获取响应式网格列数类名
   * @param breakpoints 自定义断点配置
   */
  const getGridColsClass = (breakpoints?: {
    lg?: number
    md?: number
    sm?: number
  }) => {
    const bp = {
      lg: breakpoints?.lg ?? 800,
      md: breakpoints?.md ?? 500,
      sm: breakpoints?.sm ?? 0,
    }

    return computed(() => {
      const width = containerWidth.value
      
      if (width >= bp.lg) {
        return 'grid-cols-3'
      } else if (width >= bp.md) {
        return 'grid-cols-2'
      } else {
        return 'grid-cols-1'
      }
    })
  }

  /**
   * 获取响应式断点状态
   */
  const getBreakpoint = computed(() => {
    const width = containerWidth.value
    
    if (width >= 800) {
      return 'lg'
    } else if (width >= 500) {
      return 'md'
    } else {
      return 'sm'
    }
  })

  /**
   * 初始化ResizeObserver
   */
  const initResizeObserver = () => {
    if (!elementRef.value) return

    // 查找目标容器 - 按优先级尝试不同的选择器
    const selectors = ['.vdr', '.overflow-auto', '.flex-1']
    let targetContainer: Element | null = null

    for (const selector of selectors) {
      targetContainer = elementRef.value.closest(selector)
      if (targetContainer) break
    }

    if (targetContainer) {
      resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          const { width } = entry.contentRect
          updateContainerWidth(width)
        }
      })
      resizeObserver.observe(targetContainer)
      
      // 初始化容器宽度
      updateContainerWidth(targetContainer.clientWidth)
    }
  }

  /**
   * 清理ResizeObserver
   */
  const cleanup = () => {
    if (resizeObserver) {
      resizeObserver.disconnect()
      resizeObserver = null
    }
  }

  onMounted(() => {
    initResizeObserver()
  })

  onUnmounted(() => {
    cleanup()
  })

  return {
    containerWidth: readonly(containerWidth),
    getGridColsClass,
    getBreakpoint,
    updateContainerWidth,
    initResizeObserver,
    cleanup,
  }
}

/**
 * 只读引用类型
 */
function readonly<T>(ref: Ref<T>): Readonly<Ref<T>> {
  return ref as Readonly<Ref<T>>
}