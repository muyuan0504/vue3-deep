import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue(), vueJsx()],
    resolve: {
        extensions: ['.js', '.vue'],
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    /** 路由懒加载与自定义模块化组合打包 */
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    /** 将 RouteA， RouteB 合并打包到 sync-component 前缀的文件中 */
                    'sync-component': ['./src/views/RouteA', './src/views/RouteB'],
                },
            },
        },
    },
})
