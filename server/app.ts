/**
 * @file app.ts
 * @desc server入口文件
 */
import Koa from 'koa';
import koaStatic from 'koa-static';
import favicon from 'koa-favicon';
import ssrDev from './middleware/ssr-render-dev';
import ssrProd from './middleware/ssr-render-prod';
import checkVersion from './lib/check-version';
import debugFactory from 'debug';
import logger from './lib/logger';
import config from './config/index';
import devProxyMiddleware from './middleware/dev-proxy-middleware';
import launchEditorFromChromeMiddleware from './middleware/launch-editor-dev';
import renderMiddleware from './middleware/ssr-render';
import logMiddleware from './middleware/log';

const isProd = process.env.NODE_ENV === 'production';
if (!isProd) {
    checkVersion(); // 执行node、npm版本号检查
}
const debug = debugFactory('vue:ssr:server'); // 代替console.log的日志输出，支持模块化输出；'vue:ssr:server'表示此处的debug()输出是在vue:ssr:server模块下；
const server = new Koa();

server.use(logMiddleware);
server.use(favicon('./public/favicon.ico')); // 网站图标服务
server.use(koaStatic(config.staticPath)); // 静态文件处理

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

// 其他中间件
if (!isProd) {
    server.use(launchEditorFromChromeMiddleware); // 支持从chrome的 vue devtools中，直接打开.vue文件
}

// 打包相关中间件
if (isProd) {
    server.use(ssrProd());
} else {
    server.use(ssrDev(server));
}
server.use(renderMiddleware);

// 渲染中间件
server.use(async ctx => {
    try {
        await ctx.render();
    } catch (err) {
        debug(err);
        ctx.status = err.code || 500;
    }
});

// 未捕获错误日志记录
server.on('error', (err, ctx) => {
    if (ctx.request) {
        err.request = ctx.request;
    }
    logger.error(err);
});

// 未捕获的错误处理
process.on('unhandledRejection', (error: any) => {
    logger.error({
        tags: {
            errname: 'error-unhandledRejection',
            errmessage: error.message,
            errstack: error.stack
        },
        message: 'unhandledRejection'
    });
});

process.on('uncaughtException', error => {
    logger.error({
        tags: {
            errname: 'uncaughtException',
            errmessage: error.message,
            errstack: error.stack
        },
        message: 'uncaughtException'
    });
});

server.listen(config.port, () => {
    debug('服务已开启 请访问', `http://localhost:${config.port}`);
});
