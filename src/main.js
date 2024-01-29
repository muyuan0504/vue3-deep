/** Vue3 入口文件 */
// import { createApp } from 'vue'
// import App from './App.vue'

// const app = createApp(App)

// /** 在应用级别提供的数据在该应用内的所有组件中都可以注入, 编写插件时会特别有用 */
// app.provide('globalName', 'fromApp')

// app.mount('#app')

/** vue3 引入 vue-router */

import { createApp } from 'vue'
import router from './route/index'

import App from './App'

const app = createApp(App)

app.use(router)

app.mount('#app')
