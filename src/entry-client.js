import _createApp from './entry.js';

const { app, router, store } = _createApp();

if (window.__INITIAL_STATE__) {
    store.replaceState(window.__INITIAL_STATE__);
}

router.isReady().then(() => {
    app.mount('#app');
});
