import _createApp from './entry';

const { app, router, store } = _createApp();

if ((window as any).__INITIAL_STATE__) {
    store.replaceState((window as any).__INITIAL_STATE__);
}

router.isReady().then(() => {
    app.mount('#app');
});
