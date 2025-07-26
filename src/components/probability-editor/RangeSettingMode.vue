<template>
  <div class="space-y-3">
    <p class="text-xs text-gray-600">设置主要选择区间和权重比例</p>
    <div class="grid grid-cols-3 gap-3">
      <div>
        <label class="mb-1 block text-xs font-medium text-gray-700">起始选项</label>
        <select 
          :value="selectedRange.start" 
          @change="updateRange('start', Number(($event.target as HTMLSelectElement).value))"
          class="w-full rounded border-gray-300 text-xs"
        >
          <option v-for="(option, idx) in options" :key="idx" :value="idx">
            选项 {{ option.value }}
          </option>
        </select>
      </div>
      <div>
        <label class="mb-1 block text-xs font-medium text-gray-700">结束选项</label>
        <select 
          :value="selectedRange.end" 
          @change="updateRange('end', Number(($event.target as HTMLSelectElement).value))"
          class="w-full rounded border-gray-300 text-xs"
        >
          <option 
            v-for="(option, idx) in options" 
            :key="idx" 
            :value="idx" 
            :disabled="idx < selectedRange.start"
          >
            选项 {{ option.value }}
          </option>
        </select>
      </div>
      <div>
        <label class="mb-1 block text-xs font-medium text-gray-700">区间权重</label>
        <div class="flex items-center space-x-1">
          <CustomNumberInput 
            :model-value="selectedRange.weight" 
            @update:model-value="updateRange('weight', $event)"
            class="w-16" 
            inputClass="text-xs" 
          />
          <span class="text-xs text-gray-500">%</span>
        </div>
      </div>
    </div>
    <button
      @click="$emit('apply')"
      class="w-full rounded-md bg-blue-500 px-3 py-2 text-xs font-medium text-white hover:bg-blue-600"
    >
      应用区间设置
    </button>
  </div>
</template>

<script setup lang="ts">
import type { ScaleOption } from '../../types/survey'
import type { RangeConfig } from '../ProbabilityEditor.vue'
import CustomNumberInput from '../CustomNumberInput.vue'

const props = defineProps<{
  options: ScaleOption[]
  selectedRange: RangeConfig
}>()

const emit = defineEmits<{
  'update:selectedRange': [range: RangeConfig]
  apply: []
}>()

const updateRange = (key: keyof RangeConfig, value: number | string) => {
  emit('update:selectedRange', {
    ...props.selectedRange,
    [key]: typeof value === 'string' ? Number(value) : value
  })
}
</script>