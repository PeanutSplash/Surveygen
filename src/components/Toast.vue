<template>
  <div class="pointer-events-none fixed right-0 top-0 z-[9999] flex w-full bg-transparent p-10">
    <div class="flex w-full flex-col items-center space-y-4 sm:items-end">
      <transition
        enter-active-class="transform ease-out duration-300 transition"
        enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
        enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
        leave-active-class="transition ease-in duration-100"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="isVisible" class="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
          <div class="p-4">
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <component :is="iconComponent" class="h-6 w-6" :class="iconColorClass" aria-hidden="true" />
              </div>
              <div class="ml-3 w-0 flex-1 pt-0.5">
                <p class="text-sm font-medium text-gray-900">{{ message }}</p>
              </div>
              <div class="ml-4 flex flex-shrink-0">
                <button
                  type="button"
                  @click="hideToast"
                  class="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <span class="sr-only">关闭</span>
                  <XMarkIcon class="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
          <div class="relative h-1 w-full overflow-hidden bg-gray-200">
            <div class="absolute left-0 top-0 h-full w-full bg-indigo-600 will-change-transform" :class="{ 'animate-progress-bar': isAnimating }"></div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { ExclamationTriangleIcon, InformationCircleIcon, CheckCircleIcon } from '@heroicons/vue/24/outline'
import { XMarkIcon } from '@heroicons/vue/20/solid'
import eventBus from '../utils/eventBus'

const message = ref('')
const isVisible = ref(false)
const toastType = ref('info')
const isAnimating = ref(false)
let timer: ReturnType<typeof setTimeout>
const animationDuration = 3000 // 与 setTimeout 的时间保持一致

const iconComponent = computed(() => {
  switch (toastType.value) {
    case 'warning':
      return ExclamationTriangleIcon
    case 'success':
      return CheckCircleIcon
    default:
      return InformationCircleIcon
  }
})

const iconColorClass = computed(() => {
  switch (toastType.value) {
    case 'warning':
      return 'text-yellow-400'
    case 'success':
      return 'text-green-400'
    default:
      return 'text-blue-400'
  }
})

const showToast = (msg: string, type: string = 'info') => {
  // 如果当前有显示的 toast，先移除它
  if (isVisible.value) {
    hideToast()
  }

  // 短暂延迟后显示新的 toast，以确保之前的 toast 已经完全消失
  setTimeout(() => {
    message.value = msg
    toastType.value = type
    isVisible.value = true
    isAnimating.value = true

    if (timer) {
      clearTimeout(timer)
    }

    timer = setTimeout(() => {
      hideToast()
    }, animationDuration)
  }, 100) // 100ms 的延迟，可以根据需要调整
}

const hideToast = () => {
  isVisible.value = false
  isAnimating.value = false
  if (timer) {
    clearTimeout(timer)
  }
}

onMounted(() => {
  eventBus.on('showToast', (payload: unknown) => {
    if (typeof payload === 'object' && payload !== null && 'message' in payload) {
      const { message, type = 'info' } = payload as { message: string; type?: string }
      showToast(message, type)
    }
  })
})

onUnmounted(() => {
  eventBus.off('showToast')
  if (timer) {
    clearTimeout(timer)
  }
})
</script>

<style scoped>
@keyframes progress {
  0% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(-100%);
  }
}

.animate-progress-bar {
  animation: progress 3s linear forwards;
}
</style>
