<template>
    <!-- 路由出口：路由匹配到的组件将渲染在这里 -->
    <!-- <router-view /> -->

    <!-- 使用过渡特效 -->
    <router-view v-slot="{ Component }">
        <transition ：name="route.meta.transition">
            <component :is="Component" />
        </transition>
    </router-view>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {})
</script>

<style lang="scss" scoped></style>
