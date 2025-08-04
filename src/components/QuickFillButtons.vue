<template>
  <div class="flex flex-wrap gap-1">
    <span class="text-xs text-gray-500">快速填入:</span>
    <button
      v-for="quickText in quickFillTexts"
      :key="quickText"
      @click="$emit('fill', quickText)"
      class="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600 hover:bg-gray-200"
    >
      {{ quickText }}
    </button>
  </div>
</template>

<script setup lang="ts">
// 快速填入文本选项
const quickFillTexts = [
  '很好',
  '不错',
  '一般',
  '较好',
  '需要改进',
  '非常满意',
  '比较满意',
  '不太满意',
  '同意',
  '不同意',
  '无意见',
  '经常',
  '偶尔',
  '从不',
  '是的',
  '不是',
  '不确定'
]

defineEmits<{
  fill: [text: string]
}>()
</script>