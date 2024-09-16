import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import monkey, { cdn } from 'vite-plugin-monkey'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import svgLoader from 'vite-svg-loader'
const { version } = require('./package.json')

export default defineConfig({
  plugins: [
    vue(),
    monkey({
      entry: 'src/main.ts',
      userscript: {
        icon: 'https://vitejs.dev/logo.svg',
        namespace: 'npm/vite-plugin-monkey',
        match: [
          'https://www.wjx.cn/vj/*',
          'https://www.wjx.cn/vm/*'
        ],
        version: version,
      },
      build: {
        externalGlobals: {
          vue: cdn.jsdelivr('Vue', 'dist/vue.global.prod.js'),
        },
      },
    }),
    svgLoader({
      svgoConfig: {
        multipass: true,
      },
    }),
  ],
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(version), // 使用 package.json 中的版本号
  },
})
