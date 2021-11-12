import { createSSRApp } from "vue";
import { sync } from 'vuex-router-sync';
import { _createRouter } from './router';
import { _createStore } from './store';
import App from './App.vue';

export default function _createApp() {
    const app = createSSRApp(App);
    const router = _createRouter();
    const store = _createStore();

    sync(store, router);
    app.use(router).use(store);

    return { app, router, store };
}
