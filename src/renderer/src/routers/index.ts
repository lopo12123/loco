import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        redirect: {
            name: 'Initializer'
        }
    },
    {
        path: '/initializer',
        name: 'Initializer',
        component: () => import("@renderer/views/Initializer.vue")
    },
    {
        path: '/starter',
        name: 'Starter',
        component: () => import("@renderer/views/Starter.vue")
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