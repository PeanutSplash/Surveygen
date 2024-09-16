import { createApp } from 'vue'
import './index.css'
import App from './App.vue'
import VueDraggableResizable from 'vue-draggable-resizable'
import { createPinia } from 'pinia'


createApp(App)
  .component('vue-draggable-resizable', VueDraggableResizable)
  .use(createPinia())
  .mount(
    (() => {
      const app = document.createElement('div')
      document.body.append(app)
      return app
    })(),
  )
