<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
import ViteLogo from './assets/vite.svg'
import VueLogo from './assets/vue.svg'
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center bg-white">
    <div class="mb-8 flex space-x-4">
      <a href="https://vitejs.dev" target="_blank">
        <ViteLogo class="h-24 transition-transform hover:scale-110" />
      </a>
      <a href="https://vuejs.org/" target="_blank">
        <VueLogo class="h-24 transition-transform hover:scale-110" />
      </a>
    </div>
    <HelloWorld msg="Vite + Vue + Tailwind CSS" />
  </div>
</template>
