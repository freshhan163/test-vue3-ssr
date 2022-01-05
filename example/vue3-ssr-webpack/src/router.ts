// router.js
import { createRouter, createMemoryHistory, createWebHistory } from 'vue-router';

const isServer = typeof window === 'undefined';

const history = isServer ? createMemoryHistory() : createWebHistory();

const routes = [
    { path: '/', component: () => import( /* webpackChunkName: "home" */ './pages/Home.vue'), meta: { webpackChunkName: 'home' } },
    { path: '/user/:id?', component: () => import( /* webpackChunkName: "user" */ './pages/User.vue'), meta: { webpackChunkName: 'user' } },
    { path: '/list/:id?', component: () => import( /* webpackChunkName: "list" */ './pages/List.vue'), meta: { webpackChunkName: 'list' } }
];

export function _createRouter() {
    return createRouter({
        routes,
        history
    });
};
