import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";

import Welcome from "@renderer/views/Welcome.vue";

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        redirect: {
            name: 'Welcome'
        }
    },
    {
        path: '/welcome',
        name: 'Welcome',
        component: Welcome
    },
    {
        path: '/git-view',
        name: 'GitView',
        component: () => import("@renderer/views/GitView.vue")
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export {
    router
}