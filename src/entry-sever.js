import createApp from './entry.js';

export default function() {
    const { app } = createApp();
    // 注意这里要直接返回app，不要加一层 {app}，否则 renderToString拿到的参数不对
    return app;
}
