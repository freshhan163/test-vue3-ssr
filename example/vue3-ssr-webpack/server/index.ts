/**
 * @file app.ts
 * @desc server入口文件
 */
import Koa from 'koa';
import koaStatic from 'koa-static';
import path from 'path';
import ssrProdMiddleware from './ssr-prod';
import ssrDevMiddleware from './ssr-dev';
import devProxyMiddleware from './dev-proxy';

const server = new Koa();
const isProd = process.env.NODE_ENV === 'production';

server.use(koaStatic(path.join(__dirname, '../dist'))); // 静态文件处理

// 代理中间件
if (!isProd) {
    // 对应webpack中 devServer的  proxy转发配置
    server.use(devProxyMiddleware({
        proxy: {
            '^/api/gameboard': {
                target: 'http://localhost:3500',
                changeOrigin: true
            }
        }
    }));
}

if (isProd) {
    server.use(ssrProdMiddleware());
} else {
    server.use(ssrDevMiddleware(server));
}

server.listen(3005, () => {
    console.log('服务已开启 请访问', `http://localhost:3005`);
});
