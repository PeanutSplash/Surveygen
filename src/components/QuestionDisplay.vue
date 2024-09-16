<template>
  <div ref="questionRef" class="question bg-white rounded-lg shadow-custom p-6 mb-6 max-w-6xl mx-auto text-left">
    <h3 class="text-sm font-semibold mb-8 text-gray-800">{{ question.index }}. {{ question.title }}</h3>
    <div v-if="question.type === 'radio'" 
         class="space-y-2 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-4 sm:space-y-0 mt-4">
      <div 
        v-for="option in question.options" 
        :key="option.value" 
        :class="[
          'p-3 rounded-md transition-all duration-200 ease-in-out',
          option.isSelected ? 'bg-blue-100 border-blue-500' : 'bg-gray-50 hover:bg-gray-100'
        ]"
      >
        <span :class="{'font-medium text-blue-700': option.isSelected, 'text-gray-700': !option.isSelected}">
          {{ option.text }}
        </span>
      </div>
    </div>
    <div v-else-if="question.type === 'matrix'" class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 text-xs">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4"></th>
            <th 
              v-for="header in question.headers" 
              :key="header"
              class="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {{ header }}
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="row in question.rows" :key="row.title">
            <td class="px-4 py-2 whitespace-nowrap font-medium text-gray-900 w-1/4">{{ row.title }}</td>
            <td 
              v-for="(option, index) in row.options" 
              :key="index" 
              :class="[
                'px-4 py-2 whitespace-nowrap text-center',
                option.isSelected ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-500'
              ]"
            >
              {{ option.value }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Question } from './SurveyParser'

defineProps<{
  question: Question
}>()

const questionRef = ref<HTMLElement | null>(null)

defineExpose({ questionRef })
</script>

<style scoped>
.shadow-custom {
  box-shadow: 0 -1px 2px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.06), 0 2px 4px -1px rgba(0, 0, 0, 0.1);
}

@media (min-width: 640px) {
  .question {
    width: 95%;
  }
}

@media (min-width: 1024px) {
  .question {
    width: 90%;
  }
}

@media (min-width: 1280px) {
  .question {
    width: 85%;
  }
}
</style>
