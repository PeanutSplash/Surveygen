<script setup lang="ts">
import { onMounted } from 'vue'
import { injectResetSurveyButton } from '../utils/inject/injectResetSurveyButton'

onMounted(() => {
  injectResetSurveyButton()
})
</script>

<template></template>
