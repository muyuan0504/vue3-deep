<template>
    <h3>use-watcher</h3>
    <p>
        <span>count: </span>
        <span>{{ count }}</span>
        <button @click.stop="clickCount">count++</button>
    </p>
</template>

<script setup>
import { ref, watch, watchEffect } from 'vue'

const count = ref(0)

const clickCount = () => count.value++

/**
 * watch:追踪明确侦听的数据源,仅在数据源确实改变时才会触发回调; 会避免在发生副作用时追踪依赖，因此能更加精确地控制回调函数的触发时机
 * watch 的第一个参数可以是不同形式的“数据源”: 它可以是一个 ref (包括计算属性)、一个响应式对象、一个 getter 函数、或多个数据源组成的数组
 *  单个 ref：         watch(x, (newX) => { console.log(`x is ${newX}`) })
 *  getter 函数：      watch( () => x.value + y.value, (sum) => { console.log(`sum of x + y is: ${sum}`) } )
 *  多个来源组成的数组: watch([x, () => y.value], ([newX, newY]) => { console.log(`x is ${newX} and y is ${newY}`) })
 * **不能直接侦听响应式对象的属性值，需要用一个返回该属性的 getter 函数**
 *  watch( () => obj.count, (count) => { console.log(`count is: ${count}`) } )
 *
 */

watch(
    count,
    (newVal) => {
        console.log('count changed', newVal)
    },
    { immediate: true } // 配置立即执行
)

/**
 * watchEffect: 在副作用发生期间追踪依赖
 * 它会在同步执行过程中，自动追踪所有能访问到的响应式属性; <有时其响应性依赖关系会不那么明确>
 */
watchEffect(() => {
    count.value++
})

/**
 * 停止侦听
 * 侦听器必须用同步语句创建，如果用异步回调创建一个侦听器，那么它不会绑定到当前组件上，你必须手动停止它，以防内存泄漏
 */
const unWatch = watchEffect(() => {})
unWatch() // 当该侦听器不再需要时
</script>

<style lang="scss" scoped></style>
