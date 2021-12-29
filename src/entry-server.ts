import _createApp from './entry';

export default async function (ssrContext) {
    const { app, router, store } = _createApp();

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
            if (component.serverPrefetch) {
                return component.serverPrefetch({
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
}
