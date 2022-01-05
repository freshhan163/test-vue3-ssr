import { createSSRApp } from 'vue';
import App from './App.vue';
import { _createRouter } from './router';
import { _createStore } from './store';

// 针对客户端的启动逻辑......
const app = createSSRApp(App);

const router = _createRouter();
const store = _createStore();

app.use(router).use(store);

if ((window as any).__INITIAL_STATE__) {
    store.replaceState((window as any).__INITIAL_STATE__);
}

// 这里假设 App.vue 模板的根元素有 `id="app"`
router.isReady().then(() => {
    app.mount('#app');
});
