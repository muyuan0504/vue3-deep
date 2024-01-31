import { createPinia, defineStore, storeToRefs } from 'pinia'

import { ref, computed, watch } from 'vue'

/**
 * 定义 store - defineStore
 * 你可以对 `defineStore()` 的返回值进行任意命名，但最好使用 store 的名字，同时以 `use` 开头且以 `Store` 结尾。
 * (比如 `useUserStore`，`useCartStore`，`useProductStore`)
 * 第一个参数是应用中 Store 的唯一 ID;
 * 第二个参数可接受两类值：Setup 函数或 Option 对象
 *
 * 一旦 store 被实例化，可以直接访问在 store 的 state、getters 和 actions 中定义的任何属性
 *
 */
const pinia = createPinia()

watch(
    pinia.state,
    (state) => {
        // 每当状态发生变化时，将整个 state 持久化到本地存储。
        console.log('发生了变化', state)
    },
    { deep: true }
)

/** Option Store 对象 - 基于选项式API */
const optionStore = {
    state: () => ({ count: 0 }),
    getters: {
        increase: (state) => {
            /** getter 可以通过返回函数的形式来接收参数 */
            return (a) => state.count * a
        },
        mixinStore: (state) => {
            /** 想要使用另一个 store 的 getter 的话，那就直接在 getter 内使用就好 */
            const store = useCountSetupStore()
            // const { count } = storeToRefs(store) // 对于 setup 不需要 storeToRefs ，因为本身 setup 内部就对数据进行了响应式处理
            console.log('??', store.count)
            return store.count * state.count
        },
    },
    actions: {
        increment() {
            // 类似 getter，action 也可通过 this 访问整个 store 实例, 同 getter 样，要使用另一个 store 的话，那你直接在 action 中调用就好了
            this.count++
        },
    },
}
export const useCountStore = defineStore('count', optionStore)

/**
 * setup 函数
 * Setup store 比 Option Store 带来了更多的灵活性，因为你可以在一个 store 内创建侦听器，并自由地使用任何组合式函数。
 * 不过，使用组合式函数会让 SSR 变得更加复杂
 *
 * 当用setUp时，要避免内部的响应式变量命名与组件setup函数定义的变量名同名的情况,如果同名，需要在组件setup解构时用别名代替
 *
 */
const setupStore = () => {
    const count = ref(0)
    const increase = computed(() => count.value * 2)
    const increment = () => count.value++

    // 需要自己创建 $reset 方法
    const $reset = () => {
        count.value = 0
    }

    return { count, increase, increment, $reset }
}
export const useCountSetupStore = defineStore('countSetup', setupStore)

export default pinia
