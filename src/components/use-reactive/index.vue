<template>
    <!-- 响应式数据API -->
    <h3>use-reactive</h3>
    <h5>ref:</h5>
    <p>
        <span>count: {{ count }}</span>
        <button @click.stop="incremeCount">count++</button>
    </p>
    <p>
        <span>countShallowObj: {{ countShallowObj.count }}</span>
        <button @click.stop="countShallowObj.count++">countShallowObj.count++</button>
    </p>
    <p>
        <span>countDeepObj: {{ countDeepObj.selfCount.count }}</span>
        <button @click.stop="handleDeepObj">countDeepObj.selfCount.count++</button>
    </p>
    <h5>reactive:</h5>
    <p>
        <span>compInfo: {{ compInfo.count }}</span>
        <button @click.stop="incremeCompCount">compInfo.count++</button>
    </p>
</template>

<script setup>
/**
 * <script setup> 中的顶层的导入、声明的变量和函数可在同一组件的模板中直接使用.
 * 可以理解为模板是在同一作用域内声明的一个 JavaScript 函数——它自然可以访问与它一起声明的所有内容.
 */
import { ref, reactive } from 'vue'

/** Ref 可以持有任何类型的值，包括深层嵌套的对象、数组或者 JavaScript 内置的数据结构，
 *  Ref 会使它的值具有深层响应性。这意味着即使改变嵌套对象或数组时，变化也会被检测到；也可以通过 shallow ref 来放弃深层响应性
 *  ref() 接收参数，并将其包裹在一个带有 .value 属性的 ref 对象中返回
 *
 *  ref的注意事项：在模板渲染上下文中，只有顶级的 ref 属性才会被解包
 *
 *  比如有两个变量：  const object = { id: ref(1) }  const count = ref(0)
 *  {{ count + 1 }} -> 2
 *  {{ object.id + 1 }} -> 字符串：[object Object]1  因为在计算表达式时 object.id 没有被解包，仍然是一个 ref 对象
 *  所以对于这种情况，需要将 id 单独解构成顶级属性： const { id } = object  -》 再放到模板中使用： {{ id + 1 }}
 *
 */
const count = ref(0)
const incremeCount = () => count.value++

const countShallowObj = ref({ count: 0 })

const countDeepObj = ref({ selfCount: { count: 0 } })
const handleDeepObj = () => {
    console.log(countDeepObj.value.selfCount.count++)
}

/**
 *  非原始值将通过 reactive() 转换为响应式代理
 *  与将内部值包装在特殊对象中的 ref 不同，reactive() 将使对象本身具有响应性
 */
const compInfo = reactive({ count: 0 })
const incremeCompCount = () => compInfo.count++
</script>

<style lang="scss" scoped></style>
