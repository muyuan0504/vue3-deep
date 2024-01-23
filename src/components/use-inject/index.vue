<template>
    <!-- 依赖注入 provide - inject -->
    <h3>use-inject</h3>
    <p>
        <span>global: {{ global }}</span>
        <br />
        <span>name: {{ name }}</span>
        <br />
        <span>useName: {{ useName }}</span>
    </p>
    <p>
        <button @click.stop="changeName">changeName</button>
    </p>
</template>

<script setup>
import { inject } from 'vue'

const global = inject('globalName')

/**
 * 当注入的是响应式数据时，inject 也是响应式的，并且在子组件修改，父组件也会同步变动，对于不想被变动的数据，可以用readOnley-api包裹注入的数据
 * inject获取父组件提供的change函数，可以确保所提供状态的声明和变更操作都内聚在同一个组件内，使其更容易维护
 */
const { name, changeName } = inject('name')
// const changeName = () => {
//     name.value = 'aiden' + (Math.random() * 100).toFixed(2)
// }

// 对于未 provide 的数据注入，开发模式下会提示：[Vue warn]: injection "useName" not found.
// 此时可以用到默认值：const value = inject('message', '这是默认值')
const useName = inject('useName')
</script>

<style lang="scss" scoped></style>
