<template>
    <h1>APP-vue</h1>
    <p>
        <span>count: {{ count }}</span>
        <button @click.stop="handleClick">count++</button>
    </p>
    <UseReactive />
    <!-- <UseComputed /> -->
    <!-- <keep-alive>
        <UseLifehook v-if="showFlag" @hidenComponent="hidenComponent" />
    </keep-alive> -->
    <!-- <UseWatcher /> -->
    <!-- <UseProps :count="count" is-flag use-validator /> -->
    <!-- <UseProvide /> -->
    <!-- <UseAsync /> -->
    <p>
        <button @click.stop="handleRoute">跳转RouteA</button>
    </p>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import UseReactive from './components/use-reactive/index'
import UseComputed from './components/use-computed/index'
import UseLifehook from './components/use-lifehook/index'
import UseWatcher from './components/use-watcher/index'
import UseProps from './components/use-props/index'
import UseProvide from './components/use-inject/useProvide'
import UseAsync from './components/use-Async/index'

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
