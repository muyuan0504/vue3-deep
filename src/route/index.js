// import * as VueRouter from 'vue-router'
import { createRouter, createWebHashHistory } from 'vue-router'

// import RouteA from '../views/RouteA'
const UseApi = () => import('@/views/UseApi')
const RouteA = () => import('@/views/RouteA')
const RouteB = () => import('@/views/RouteB')

/** routes：路由配置 */
const routes = [
    {
        path: '/',
        redirect: '/use-api',
    },
    {
        path: '/use-api',
        component: UseApi,
    },
    {
        /**
         * 路径参数 用冒号 : 表示。当一个路由被匹配时，它的 params 的值将在每个组件中以 this.$route.params 的形式暴露出来
         * 使用 ? 修饰符(0 个或 1 个)将一个参数标记为可选
         */
        path: '/route-a/:id?',
        name: 'RouteA',
        component: RouteA,
        // meta, 路由元信息
        meta: { transition: 'slide-right' },
        // 路由独享守卫钩子
        beforeEnter: (to, from) => {
            console.log('路由独享钩子触发', to, from)
            return true
        },
    },
    {
        path: '/route-b',
        name: 'RouteB',
        component: RouteB,
    },
]

const router = createRouter({
    // history: 采用 hash 模式
    history: createWebHashHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        // return 期望滚动到哪个的位置

        /** 始终滚动到顶部, 也可以返回 promise 延迟滚动 */
        return { top: 0 }
    },
})

/** 全局守卫 */
router.beforeEach((to, from) => {
    console.log('route from : ', from)
    console.log('route to: ', to)
    return true
})

export default router
