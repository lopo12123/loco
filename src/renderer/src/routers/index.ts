import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";

import Welcome from "@renderer/views/Welcome.vue";

const routes: RouteRecordRaw[] = [
    {
        // todo 通过js判断输入参数进行不同跳转
        path: '/',
        redirect: {
            name: 'Welcome'
        }
    },
    {
        path: '/welcome',
        name: 'Welcome',
        component: Welcome
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export {
    router
}