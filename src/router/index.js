const {
    validFeeds
} = require('@/common/api');
const {
    createRouter,
    createMemoryHistory,
    createWebHistory,
} = require('vue-router');

const isServer = typeof window === 'undefined';

let history = isServer ? createMemoryHistory() : createWebHistory();

const routes = [
    {
        path: '/',
        redirect: '/news',
    },
    {
        path: '/:feed/:page(\\d+)?',
        name: 'feed-page',
        component: () =>
            import( /* webpackChunkName: "feeds" */ '@/pages/FeedList.vue'),

        props: (route) => {
            const maxPage = validFeeds[route.params.feed] ? validFeeds[route.params.feed]['pages'] : 1;
            console.log('maxPage =', maxPage, route.params);
            return {
                feed: route.params.feed,
                page: Number(route.params.page) || 1,
                maxPage
            };
        }
    },
    {
        path: '/user/:id?',
        name: 'user-id',
        component: () =>
            import( /* webpackChunkName: 'user' */ '@/pages/UserPage.vue')
    },
    {
        path: '/item/:id?',
        name: 'item-id',
        component: () =>
            import( /* webpackChunkName: 'item' */ '@/pages/ItemPage.vue')
    }
];

export function _createRouter() {
    return createRouter({
        routes,
        history
    });
}
