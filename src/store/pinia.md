## pinia

### Store

保存状态和业务逻辑的实体，承载着全局状态，它并不与组件树绑定。

定义 store: defineStore()

可以认为 state 是 store 的数据 (data)，getters 是 store 的计算属性 (computed)，而 actions 则是方法 (methods)

-   state

state 是 store 的核心，state 被定义为一个返回初始状态的函数，这使得 Pinia 可以同时支持服务端和客户端。

1. state 的访问：

可以通过 store 实例访问 state，直接对其进行读写

2. state 的重置

```javascript
// 使用选项式API时，可以直接调用 store 的 $reset() 方法将 state 重置为初始值，在 $reset() 内部，会调用 state() 函数来创建一个新的状态对象，并用它替换当前状态
const store = useStore()
store.$reset()

// setup 方式声明 store 时，需要手动创建 $reset 方法
const setupStore = () => {
    const count = ref(0)
    const increase = computed(() => count.value++)
    const increment = () => count.value++

    // 需要自己创建 $reset 方法
    const $reset = () => {
        count.value = 0
    }

    return { count, increase, increment, $reset }
}
export const useCountSetupStore = defineStore('countSetup', setupStore)
```

-   getter

Getter 完全等同于 store 的 state 的计算值，可以通过 defineStore() 中的 getters 属性来定义它们

-   action
