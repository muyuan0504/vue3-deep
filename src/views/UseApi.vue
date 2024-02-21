<template>
    <!-- 为了保证 Transition过渡效果，用div当根节点包裹所有内容 -->
    <div>
        <h1>APP-vue</h1>
        <!-- <p>
            <span>count: {{ count }}</span>
            <button @click.stop="handleClick">count++</button>
        </p> -->
        <!-- <UseReactive /> -->
        <!-- <UseComputed /> -->
        <!-- <keep-alive>
        <UseLifehook v-if="showFlag" @hidenComponent="hidenComponent" />
    </keep-alive> -->
        <!-- <UseWatcher /> -->
        <!-- <UseProps :count="count" is-flag use-validator /> -->
        <!-- <UseProvide /> -->
        <!-- <UseAsync /> -->
        <p>
            <span>store in route B - countStore: {{ countStore.count }}</span>
            <button @click="countStoreClick">countStore.count++</button>
            <br />
            <span>store in route B - countSetup: {{ countSetup }}</span>
            <button @click="setupClick">countSetup++</button>
        </p>
        <p>
            <button @click.stop="handleRoute">跳转RouteA</button>
            <router-link to="/route-b">跳转RouteB</router-link>
        </p>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import UseReactive from '../components/use-reactive/index'
import UseComputed from '../components/use-computed/index'
import UseLifehook from '../components/use-lifehook/index'
import UseWatcher from '../components/use-watcher/index'
import UseProps from '../components/use-props/index'
import UseProvide from '../components/use-inject/useProvide'
import UseAsync from '../components/use-Async/index'

/** 跨组件使用 store  */
import { storeToRefs } from 'pinia'
import { useCountStore, useCountSetupStore } from '@/store/index'
const countStore = useCountStore()
const countStoreClick = () => {
    countStore.count++
}
const store = useCountSetupStore()
const { count: countSetup } = storeToRefs(store) // 由于在组件内部使用了count变量，所以需要使用别名countSetup
const { increment } = store
const setupClick = () => {
    console.log('点击')
    increment()
}

/** 父子组件props的跨实例更新 */
const count = ref(0)
const handleClick = () => count.value++

/** 组件v-if渲染与keep-alive */
const showFlag = ref(true)
const hidenComponent = () => (showFlag.value = false)

/** vue-router */
const router = useRouter()
const route = useRoute()
const handleRoute = () => {
    /**
     * 因为在 setup 里面没有访问 this，所以我们不能再直接访问 this.$router 或 this.$route
     * 作为替代，使用 useRouter 和 useRoute 函数
     */
    // this.$router.push({ name: 'RouteA' })

    router.push({ name: 'RouteA', params: { id: 2 } })
}
</script>

<style scoped>
header {
    line-height: 1.5;
}

.logo {
    display: block;
    margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
    header {
        display: flex;
        place-items: center;
        padding-right: calc(var(--section-gap) / 2);
    }

    .logo {
        margin: 0 2rem 0 0;
    }

    header .wrapper {
        display: flex;
        place-items: flex-start;
        flex-wrap: wrap;
    }
}
</style>
