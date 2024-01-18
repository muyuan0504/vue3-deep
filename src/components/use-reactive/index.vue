<template>
    <!-- 响应式数据API -->
    <h3>use-reactive</h3>
    <p>
        <span>count: </span>
        <span>{{ count }}</span>
    </p>
    <p>
        <span>compInfo: </span>
        <span>{{ compInfo.count }}</span>
    </p>
    <p>
        <button @click.stop="incremeCount">count++</button>
        <br />
        <button @click.stop="incremeCompCount">compInfo.count++</button>
    </p>
</template>

<script setup>
/**
 * <script setup> 中的顶层的导入、声明的变量和函数可在同一组件的模板中直接使用.
 * 可以理解为模板是在同一作用域内声明的一个 JavaScript 函数——它自然可以访问与它一起声明的所有内容.
 */
import { ref, reactive } from 'vue'

const count = ref(0)
const incremeCount = () => count.value++

const compInfo = reactive({ count: 0 })
const incremeCompCount = () => compInfo.count++
</script>

<style lang="scss" scoped></style>
