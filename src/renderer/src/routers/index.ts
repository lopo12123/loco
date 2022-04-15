import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";

import Starter from "../views/Starter.vue";

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        redirect: {
            name: 'Starter'
        }
    },
    {
        path: '/starter',
        name: 'Starter',
        component: Starter
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