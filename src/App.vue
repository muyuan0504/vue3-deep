<template>
    <h1>APP-vue</h1>
    <!-- <UseReactive /> -->
    <!-- <UseComputed /> -->
    <keep-alive>
        <UseLifehook v-if="showFlag" @hidenComponent="hidenComponent" />
    </keep-alive>
</template>

<script setup>
import { ref } from 'vue'
import UseReactive from './components/use-reactive/index'
import UseComputed from './components/use-computed/index'
import UseLifehook from './components/use-lifehook/index'

const showFlag = ref(true)

const hidenComponent = () => (showFlag.value = false)
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
