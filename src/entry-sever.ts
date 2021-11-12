import _createApp from './entry';

export default async function(context) {
    const { app, router, store } = _createApp();

    router.push(context.url);
    await router.isReady();

    if (router.currentRoute.value.matched.length === 0) {
        context.throw(404, 'Not Found');
    }

    const matchedComponents = router.currentRoute.value.matched.flatMap(record => Object.values(record.components));
    try {
        await Promise.all(matchedComponents.map((component) => {
            if (component.serverPrefetch) {
                return component.serverPrefetch({
                    store, 
                    route: router.currentRoute.value
                })
            }
        }))
    } catch(error) {
        console.log(error)
    }
    context.state = store.state;

    // 注意这里要直接返回app，不要加一层 {app}，否则 renderToString拿到的参数不对
    return app;
}
