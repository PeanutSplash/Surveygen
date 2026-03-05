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
        name: '🔥问卷星自动答题｜批量刷问卷｜自定义概率比例🔥',
        description: '问卷星(wjx.cn)自动答题脚本，支持单选/多选/填空/矩阵/量表/下拉框，可自定义每个选项概率比例，批量循环提交刷问卷，模拟真人操作，自动处理验证，持续更新中',
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
