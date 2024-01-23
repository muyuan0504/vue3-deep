<template>
    <h3>use-computed</h3>
    <p>
        <span>countA: </span>
        <span>{{ countA }}</span>
        <br />
        <span>countB: </span>
        <span>{{ countB }}</span>
        <br />
        <span>total: </span>
        <span>{{ totalCount }}</span>
        <br />
        <span>selfCount: </span>
        <span>{{ selfCount }}</span>
    </p>
    <p>
        <button @click.stop="handleClick">count++</button>
    </p>
</template>

<script setup>
import { ref, computed } from 'vue'
const countA = ref(0)
const countB = ref(1)

const handleClick = () => {
    countA.value++
    selfCount.value += 100
}

/** computed() 方法期望接收一个 getter 函数，返回值为一个计算属性 ref，开发模式下会提醒开发者计算属性的值 readonly
 *  计算属性 ref 也会在模板中自动解包，因此在模板表达式中引用时无需添加 .value; 但是在 countA + countB 表达式计算时，需要引用value，否则得到的是Object的字符串相加
 */
const totalCount = computed(() => countA.value + countB.value)

/** 可写计算属性 */

const selfCount = computed({
    get() {
        return countA.value * 2
    },
    set(newVal) {
        console.log(newVal)
        countA.value = newVal
    },
})
</script>

<style lang="scss" scoped></style>
