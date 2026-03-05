import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import monkey, { cdn } from 'vite-plugin-monkey'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import svgLoader from 'vite-svg-loader'
const { version } = require('./package.json')

export default defineConfig({
  build: {
    minify: false,
    cssMinify: false,
  },
  plugins: [
    vue(),
    monkey({
      entry: 'src/main.ts',
      userscript: {
        name: '问卷星自动答题助手',
        description: '问卷星(wjx.cn)自动答题工具，支持单选、多选、填空、矩阵、量表等题型，支持概率设置和高级模式',
        author: 'PeanutSplash',
        license: 'Apache-2.0',
        icon: 'https://vitejs.dev/logo.svg',
        namespace: 'npm/vite-plugin-monkey',
        match: [
          'https://www.wjx.cn/vj/*',
          'https://www.wjx.cn/vm/*',
          'https://www.wjx.cn/wjx/join/*'
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
