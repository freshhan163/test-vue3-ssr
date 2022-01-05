// entry-server.ts
import { createSSRApp } from 'vue';
import App from './App.vue';
import { _createRouter } from './router';
import { _createStore } from './store';

export default async function (ssrContext) {
    const app = createSSRApp(App);

    const router = _createRouter();
    const store = _createStore(); 

    app.use(router).use(store);

    router.push(ssrContext.url);
    await router.isReady();

    const matchedRoutes = router.currentRoute.value.matched;

    if (matchedRoutes.length === 0) {
        throw new Error('404');
    }

    // 用于server render时入口处css加载
    ssrContext.initialChunkName = [];

    matchedRoutes.forEach(chunk => {
        const webpackChunkName = chunk.meta && chunk.meta.webpackChunkName ? chunk.meta.webpackChunkName : '';
        if (webpackChunkName && !ssrContext.initialChunkName.includes(webpackChunkName)) {
            ssrContext.initialChunkName.push(chunk.meta.webpackChunkName);
        }
    });

    const matchedComponents = matchedRoutes.flatMap(record => Object.values(record.components));
    try {
        await Promise.all(matchedComponents.map(component => {
            if ((component as any).serverPrefetch) {
                return (component as any).serverPrefetch({
                    store,
                    route: router.currentRoute.value
                });
            }
        }));
    } catch (error) {
        console.log(error);
    }

    ssrContext.state = store.state;

    return app;
};