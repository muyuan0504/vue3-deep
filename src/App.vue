<template>
    <!-- 路由出口：路由匹配到的组件将渲染在这里 -->
    <!-- <router-view /> -->

    <!-- 使用过渡特效，为了特效生效，需要保证Transition组件包裹的组件只有一个根节点 -->
    <router-view v-slot="{ Component, route }">
        <transition :name="route.meta.transition">
            <component :is="Component" />
        </transition>
    </router-view>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {})
</script>

<style lang="scss" scoped></style>
