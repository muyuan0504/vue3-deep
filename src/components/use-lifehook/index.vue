<template>
    <h5>use-lifehook</h5>
    <p>
        <span>count: </span>
        <span>{{ count }}</span>
        <button @click="clickHandler">count++</button>
        <button @click="$emit('hidenComponent')">卸载当前组件</button>
    </p>
</template>

<script setup>
import { ref, onBeforeMount, onMounted, onBeforeUnmount, onUnmounted } from 'vue'
import { onBeforeUpdate, onUpdated } from 'vue'
import { onActivated, onDeactivated } from 'vue'
import { onErrorCaptured } from 'vue'
import { onRenderTracked, onRenderTriggered } from 'vue'
const count = ref(0)

const clickHandler = () => count.value++

/** 会在服务端渲染期间被调用的hook函数只有：onErrorCaptured 和 onServerPrefetch
 *  组件一次加载依次触发：onBeforeMount -> onRenderTracked(仅在开发模式下) -> onMounted -> onActivated(当配置了keep-alive组件时)
 *  组件一次更新依次触发：onRenderTriggered(仅在开发模式下) -> onBeforeUpdate -> onRenderTracked(仅在开发模式下) -> onUpdated
 *  组件一次卸载依次触发：onBeforeUnmount -> onUnmounted，当配置了 keep-alive 组件时，只会触发 onDeactivated
 */

onBeforeMount(() => {
    // 在组件被挂载之前被调用
    console.log(`use-lifehook: onBeforeMount.`)
})
onMounted(() => {
    // 在组件挂载完成后执行
    console.log(`use-lifehook: onMounted.`)
})
onBeforeUnmount(() => {
    // 在组件实例被卸载之前调用 - 当这个钩子被调用时，组件实例依然还保有全部的功能
    console.log(`use-lifehook: onBeforeUnmount.`)
})
onUnmounted(() => {
    // 在组件实例被卸载之后调用
    // 这个钩子可以用来在 Vue 更新 DOM 之前访问 DOM 状态。在这个钩子中更改状态也是安全的
    console.log(`use-lifehook: onUnmounted.`)
})

onBeforeUpdate(() => {
    // 在组件即将因为响应式状态变更而更新其 DOM 树之前调用
    console.log(`use-lifehook: onBeforeUpdate.`)
})
onUpdated(() => {
    // 组件因为响应式状态变更而更新其 DOM 树之后调用
    // **不要在 updated 钩子中更改组件的状态，这可能会导致无限的更新循环！**
    console.log(`use-lifehook: onUpdated.`)
})

onActivated(() => {
    // 组件实例是 <KeepAlive> 缓存树的一部分，当组件被插入到 DOM 中时调用
    console.log(`use-lifehook: onActivated.`)
})
onDeactivated(() => {
    // 若组件实例是 <KeepAlive> 缓存树的一部分，当组件从 DOM 中被移除时调用
    console.log(`use-lifehook: onDeactivated.`)
})

onErrorCaptured(() => {
    // 在捕获了后代组件传递的错误时调用
    // 错误可以从以下几个来源中捕获: 组件渲染 事件处理器 生命周期钩子 setup() 函数 侦听器 自定义指令钩子 过渡钩子
    console.log(`use-lifehook: onErrorCaptured.`)
})

onRenderTracked(() => {
    // 当组件渲染过程中追踪到响应式依赖时调用
    console.log(`use-lifehook: onRenderTracked.`)
})
onRenderTriggered((e) => {
    // 当响应式依赖的变更触发了组件渲染时调用
    console.log(`use-lifehook: onRenderTriggered.`, e)
})
</script>

<style lang="scss" scoped></style>
