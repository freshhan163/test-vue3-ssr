/**
 *    @file dev-proxy
 *    @desc 【本地开发环境使用】对应webpack-dev-server的 proxy选项
 */
import { Context } from 'koa';
import config from '../config';
import HttpProxy from 'http-proxy';
import parse from 'co-body';
const proxy = HttpProxy.createProxyServer();

interface DevOptions {
    proxy?: {
        [propName: string]: {
            target: string;
            changeOrigin: boolean;
            pathRewrite?: {
                [propName: string]: any;
            };
            route?: {
                [propName: string]: any;
            }
        };
    };
}

// Response处理：输出log日志
proxy.on('proxyRes', function (proxyRes, req) {
    // @ts-ignore
    const context = req.context as Context;
    // @ts-ignore
    context.logger.info({
        tags: {
            statusCode: proxyRes.statusCode.toString()
        },
        message: context.url
    });
});

export default (devOptions: DevOptions = {}) => {
    return async function (ctx: Context, next: ()=> Promise<any>) {
        const proxyOptions = devOptions.proxy || {};

        let needProxy = false;
        // 默认转发路径
        let pathProxy = {
            target: config.defaultProxyServer,
            changeOrigin: true
        };
        Object.keys(proxyOptions).some(key => {
            if (ctx.path.match(key)) {
                pathProxy = Object.assign({ logLevel: 'warn' }, proxyOptions[key]);
                needProxy = true;
                return true;
            }
        });

        // 未命中proxy配置的，直接返回
        if (!needProxy) {
            return next();
        }

        ctx.logger.info({
            tags: {
                from: ctx.path,
                to: pathProxy.target
            },
            message: '代理转发'
        });

        const body = await parse.json(ctx) || {};

        // @ts-ignore
        ctx.request.body = body;
        // @ts-ignore
        ctx.req.context = ctx;

        // 命中配置的，需要处理一下
        await new Promise<void>(resolve => {
            proxy.web(ctx.req, ctx.res, pathProxy, e => {
                if (e) {
                    ctx.logger.error(e);
                }
                resolve();
            });
        });
    };
}
