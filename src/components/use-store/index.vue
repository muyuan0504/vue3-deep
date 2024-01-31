<template>
    <h6>use store</h6>
    <p>
        <span>count: {{ count }}</span>
        <br />
        <span>count-getter: {{ increase(10) }}</span>
        <br />
        <div>mixinStore: {{ mixinStore }}</div>
        <button @click.stop="increment">count++</button>
        <button @click.stop="resetCount">count reset</button>
    </p>
    <p>
        <span>countSetup: {{ countSetup }}</span>
        <button @click.stop="incrementSetup">countSetup++</button>
        <button @click.stop="resetCountSetup">countSetup reset</button>
        <button @click.stop="changeCountSetup">countSetup change</button>
    </p>
    <router-link to="/use-api">返回</router-link>
</template>

<script setup>
/**
 * 为了从 store 中提取属性时保持其响应性，需要使用 storeToRefs()。它将为每一个响应式属性创建引用
 */
import { storeToRefs } from 'pinia'
import { useCountStore, useCountSetupStore } from '@/store/index'

const store = useCountStore()
const { count, increase, mixinStore } = storeToRefs(store)
const { increment } = store
const resetCount = () => {
    // 使用选项式 API 时，可以通过调用 store 的 $reset() 方法将 state 重置为初始值
    // 在 $reset() 内部，会调用 state() 函数来创建一个新的状态对象，并用它替换当前状态
    store.$reset()
}

const storeSetup = useCountSetupStore()
const { count: countSetup } = storeToRefs(storeSetup)
const { increment: incrementSetup } = storeSetup

/** 重置 state */
const resetCountSetup = () => {
    storeSetup.$reset()
}

/** 变更 state */
const changeCountSetup = () => {
    storeSetup.$patch((state) => {
        state.count = (Math.random() * 10).toFixed(2)
    })
}
</script>

<style lang="scss" scoped></style>
