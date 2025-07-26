<template>
  <div class="space-y-3">
    <p class="text-xs text-gray-600">选择常见的概率分布模式</p>
    <div class="grid grid-cols-2 gap-2">
      <button
        @click="$emit('apply', 'normal')"
        class="flex flex-col items-center rounded-md border border-gray-200 bg-white p-3 hover:border-blue-300 hover:bg-blue-50"
      >
        <div class="mb-1 flex h-6 items-end space-x-1">
          <div class="w-1 h-2 bg-blue-300"></div>
          <div class="w-1 h-4 bg-blue-400"></div>
          <div class="w-1 h-6 bg-blue-500"></div>
          <div class="w-1 h-4 bg-blue-400"></div>
          <div class="w-1 h-2 bg-blue-300"></div>
        </div>
        <span class="text-xs font-medium">正态分布</span>
        <span class="text-xs text-gray-500">中间选项多</span>
      </button>
      
      <button
        @click="$emit('apply', 'left-skew')"
        class="flex flex-col items-center rounded-md border border-gray-200 bg-white p-3 hover:border-blue-300 hover:bg-blue-50"
      >
        <div class="mb-1 flex h-6 items-end space-x-1">
          <div class="w-1 h-6 bg-blue-500"></div>
          <div class="w-1 h-4 bg-blue-400"></div>
          <div class="w-1 h-3 bg-blue-300"></div>
          <div class="w-1 h-2 bg-blue-200"></div>
          <div class="w-1 h-1 bg-gray-300"></div>
        </div>
        <span class="text-xs font-medium">左偏分布</span>
        <span class="text-xs text-gray-500">低分选项多</span>
      </button>
      
      <button
        @click="$emit('apply', 'right-skew')"
        class="flex flex-col items-center rounded-md border border-gray-200 bg-white p-3 hover:border-blue-300 hover:bg-blue-50"
      >
        <div class="mb-1 flex h-6 items-end space-x-1">
          <div class="w-1 h-1 bg-gray-300"></div>
          <div class="w-1 h-2 bg-blue-200"></div>
          <div class="w-1 h-3 bg-blue-300"></div>
          <div class="w-1 h-4 bg-blue-400"></div>
          <div class="w-1 h-6 bg-blue-500"></div>
        </div>
        <span class="text-xs font-medium">右偏分布</span>
        <span class="text-xs text-gray-500">高分选项多</span>
      </button>
      
      <button
        @click="$emit('apply', 'uniform')"
        class="flex flex-col items-center rounded-md border border-gray-200 bg-white p-3 hover:border-blue-300 hover:bg-blue-50"
      >
        <div class="mb-1 flex h-6 items-end space-x-1">
          <div class="w-1 h-4 bg-blue-400"></div>
          <div class="w-1 h-4 bg-blue-400"></div>
          <div class="w-1 h-4 bg-blue-400"></div>
          <div class="w-1 h-4 bg-blue-400"></div>
          <div class="w-1 h-4 bg-blue-400"></div>
        </div>
        <span class="text-xs font-medium">均匀分布</span>
        <span class="text-xs text-gray-500">所有选项均等</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DistributionType } from '../../utils/probabilityDistribution'

defineEmits<{
  apply: [type: DistributionType]
}>()

</script>