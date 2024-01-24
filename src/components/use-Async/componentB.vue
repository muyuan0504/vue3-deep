<template>
    <h3>is component B</h3>
</template>

<script setup>
import { onBeforeMount, onMounted } from 'vue'
onBeforeMount(() => console.log('componentB 开始挂载'))
onMounted(() => console.log('componentB 挂载完毕'))
</script>

<style lang="scss" scoped></style>
