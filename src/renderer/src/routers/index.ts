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
    },
    {
        path: '/config-view',
        name: 'ConfigView',
        component: () => import("@renderer/views/ConfigView.vue")
    },
    {
        path: '/commit-history',
        name: 'CommitHistory',
        component: () => import("@renderer/views/CommitHistory.vue")
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export {
    router
}