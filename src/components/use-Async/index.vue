<template>
    <!-- 异步组件 -->
    <h3>use-async-component 异步组件：</h3>
    <p>
        <span>引入的componentA 子组件</span>
        <ComponentA />
    </p>
    <p>
        <span>引入的componentB 子组件</span>
        <!-- setTimeout执行回调后，componentB进入渲染 -->
        <ComponentB />
    </p>
    <p>
        <span>引入的componentC 子组件</span>
        <ComponentC />
    </p>
</template>

<script setup>
import { defineAsyncComponent } from 'vue'

/**
 * defineAsyncComponent 方法接收一个返回 Promise 的加载函数
 * ES 模块动态导入也会返回一个 Promise，所以多数情况下我们会将它和 defineAsyncComponent 搭配使用
 */
const ComponentB = defineAsyncComponent(() => {
    return new Promise((resolve) => {
        // ...从服务器获取组件
        const compB = import('./componentB')
        setTimeout(() => {
            resolve(/* 获取到的组件 */ compB)
        }, 3000)
    })
})

const ComponentA = defineAsyncComponent(() => import('./componentA'))

/** defineAsyncComponent() 高级选项 */

// const LoadingComponent = import('./componentWait')
// const ErrorComponent = import('./componentError')
const ComponentC = defineAsyncComponent({
    // 加载函数
    loader: () => {
        console.log('执行加载函数？？')
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(import('./componentC'))
            }, 6000)
        })
    },
    // 加载异步组件时使用的组件 - 由于 import 是异步的，所以这里不好模拟loadingComponent，内部会报错 Component is missing template or render function
    // loadingComponent: LoadingComponent,
    // 展示加载组件前的延迟时间，默认为 200ms
    delay: 1000,
    // 加载失败后展示的组件 - 跟 loadingComponent 存在一样的问题
    // errorComponent: ErrorComponent,
    // 如果提供了一个 timeout 时间限制，并超时了
    // 也会显示这里配置的报错组件，默认值是：Infinity
    timeout: 9000,
})
</script>

<style lang="scss" scoped></style>
