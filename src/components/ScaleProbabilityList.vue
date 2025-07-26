<template>
  <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
    <div 
      v-for="(option, idx) in options" 
      :key="option.value" 
      class="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-2 text-xs"
    >
      <div class="flex items-center space-x-1.5">
        <div
          class="h-2.5 w-2.5 rounded-full border border-gray-300"
          :style="{ backgroundColor: getProbabilityStyle(option).backgroundColor || '#f3f4f6' }"
        ></div>
        <span class="font-medium text-gray-700">{{ option.value }}</span>
      </div>
      <div class="flex items-center">
        <template v-if="isEditing && editMode === 'manual'">
          <CustomNumberInput 
            :model-value="editedProbabilities[idx]" 
            @update:model-value="$emit('updateProbability', { index: idx, value: Number($event) })"
            :min="0"
            :max="100"
            class="w-12" 
            inputClass="text-xs px-1 py-0.5"
          />
        </template>
        <template v-else>
          <span class="font-medium text-gray-600">
            {{ Math.round((isEditing ? editedProbabilities[idx] : option.probability) || 0) }}%
          </span>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ScaleOption } from '../types/survey'
import CustomNumberInput from './CustomNumberInput.vue'

defineProps<{
  options: ScaleOption[]
  editedProbabilities: number[]
  isEditing: boolean
  editMode: 'quick' | 'range' | 'manual'
  getProbabilityStyle: (option: ScaleOption) => Record<string, string>
}>()

defineEmits<{
  updateProbability: [data: { index: number, value: number }]
}>()
</script>