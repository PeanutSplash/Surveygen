<template>
  <div class="relative inline-block" @mouseenter="showTooltip" @mouseleave="hideTooltip">
    <slot />
    <transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isVisible"
        class="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 transform"
      >
        <div class="whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white shadow-lg">
          {{ text }}
          <!-- 小三角形箭头 -->
          <div class="absolute left-1/2 top-full -translate-x-1/2 transform">
            <div class="border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  text: string
  delay?: number
}

const props = withDefaults(defineProps<Props>(), {
  delay: 500
})

const isVisible = ref(false)
let timeoutId: ReturnType<typeof setTimeout> | null = null

const showTooltip = () => {
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
  timeoutId = setTimeout(() => {
    isVisible.value = true
  }, props.delay)
}

const hideTooltip = () => {
  if (timeoutId) {
    clearTimeout(timeoutId)
    timeoutId = null
  }
  isVisible.value = false
}
</script>
