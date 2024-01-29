<template>
    <h3>router-A</h3>
    <p>
        <span>route.params: {{ route.params.id }}</span>
    </p>
    <p>
        <router-link to="/use-api">返回</router-link>
    </p>
</template>

<script setup>
import { onMounted, watch } from 'vue'
/**
 * useRouter: 相当于获取 this.$router
 * useRoute:  相当于获取 this.$route
 * onBeforeRouteUpdate: 添加 update 守卫
 * onBeforeRouteLeave: 添加 leave 守卫
 */
import { useRouter, useRoute, onBeforeRouteUpdate, onBeforeRouteLeave } from 'vue-router'

const router = useRouter()
const route = useRoute()

watch(
    () => route.params,
    (val) => {
        console.log('watch触发监听 params.id发生了变化', val)
    },
    {
        immediate: true,
    }
)

onMounted(() => {
    console.log('router: ', router)
    console.log('route: ', route.params.id)
})

/**
 * 在当前路由改变，但是该组件被复用时调用
 * 举例来说，对于一个带有动态参数的路径 `/users/:id`，在 `/users/1` 和 `/users/2` 之间跳转的时候，由于会渲染同样的组件，因此组件实例会被复用，触发此守卫
 */
onBeforeRouteUpdate((to, from) => {
    console.log('onBeforeRouteUpdate', to, from)
})

/** 在导航离开渲染该组件的对应路由时调用 */
onBeforeRouteLeave((to, from) => {
    console.log('onBeforeRouteLeave', to, from)
})
</script>

<style lang="scss" scoped></style>
