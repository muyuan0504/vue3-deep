<template>
    <h3>use-props</h3>
    <p>
        <span>count: {{ count }}</span>
        <br />
        <span>isFlag: {{ isFlag }}</span>
        <br />
        <span>useFlag: {{ useFlag }}</span>
        <br />
        <span>selfCount: {{ selfCount }}</span>
    </p>
    <p>
        <button @click.stop="useFlag = !useFlag">changeFlag</button>
    </p>
</template>

<script setup>
import { ref } from 'vue'
/**
 * 一个组件需要显式声明它所接受的 props，这样 Vue 才能知道外部传入的哪些是 props，哪些是透传 attribute
 * props 可以使用 defineProps() 宏来声明，接收的参数包括：字符串数组 || 对象 props的对象配置属性跟vue2差不多，都支持 type,require,default,validator配置
 */
// const { count } = defineProps(['count'])
const { count, isFlag, selfCount } = defineProps({
    count: Number,
    isFlag: Boolean, // 当父组件仅写上 prop 但不传值，会隐式转换为 `true`
    selfCount: { type: Number, default: 9 },
    useValidator: {
        type: Boolean,
        /** 在校验函数中，完整的props作为第二个参数传入 */
        validator(value, props) {
            console.log('props: ', props)
            return true
        },
    },
})

const useFlag = ref(isFlag)
</script>

<style lang="scss" scoped></style>
