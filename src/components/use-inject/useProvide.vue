<template>
    <!-- 允许在应用层 - main.js中提供provide -->
    <h3>use-provide</h3>
    <p>
        <span>name: {{ name }}</span>
        <button @click.stop="changeName">changeName</button>
    </p>
    <use-inject />
</template>

<script setup>
import UseInject from './index'
import { ref, provide } from 'vue'

const name = ref('aiden')

const changeName = () => {
    name.value = 'aiden' + (Math.random() * 100).toFixed(2)
}

/**
 * provide() 函数接收两个参数
 * 第一个参数被称为注入名，可以是一个字符串或是一个 Symbol;后代组件会用注入名来查找期望注入的值。一个组件可以多次调用 provide()，使用不同的注入名，注入不同的依赖值
 * 第二个参数是提供的值，值可以是任意类型，包括响应式的状态
 *
 * 当提供 / 注入响应式的数据时，建议尽可能将任何对响应式状态的变更都保持在供给方组件中，可以确保所提供状态的声明和变更操作都内聚在同一个组件内，使其更容易维护
 */
// provide('name', name)
provide('name', {
    name,
    changeName,
})
</script>

<style lang="scss" scoped></style>
