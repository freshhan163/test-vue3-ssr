const {
    createRouter,
    createMemoryHistory,
    createWebHistory
} = require('vue-router');

const isServer = typeof window === 'undefined';

let history = isServer ? createMemoryHistory() : createWebHistory();

const routes = [
    {
        path: '/',
        redirect: '/news'
    },
    {
        path: '/news/:page?',
        name: 'feed-page',
        component: () =>
            import( /* webpackChunkName: "feeds" */ '@/pages/FeedList.vue'),

        props: route => ({
            feed: 'news',
            page: Number(route.params.page) || 1,
            maxPage: 10
        }),
        meta: {
            webpackChunkName: 'feeds' // 必须声明！ 用于入口处 css加载
        }
    },
    {
        path: '/user/:id?',
        name: 'user-id',
        component: () =>
            import( /* webpackChunkName: 'user' */ '@/pages/UserPage.vue'),
        meta: {
            webpackChunkName: 'user' // 必须声明！ 用于入口处 css加载
        }
    },
    {
        path: '/item/:id?',
        name: 'item-id',
        component: () =>
            import( /* webpackChunkName: 'item' */ '@/pages/ItemPage.vue'),
        meta: {
            webpackChunkName: 'item' // 必须声明！ 用于入口处 css加载
        }
    },
    {
        path: '/:pathMatch(.*)*',
        name: '404',
        component: () => import(/* webpackChunkName: '404page' */ '@/pages/404.vue'),
        meta: {
            webpackChunkName: '404page' // 必须声明！ 用于入口处 css加载
        }
    }
];

export function _createRouter() {
    return createRouter({
        routes,
        history
    });
}
