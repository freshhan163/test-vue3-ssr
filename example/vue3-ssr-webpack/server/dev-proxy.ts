/**
 *    @file dev-proxy
 *    @desc 【本地开发环境使用】对应webpack-dev-server的 proxy选项
 */
import { Context } from 'koa';
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

export default (devOptions: DevOptions = {}) => {
    return async function (ctx: Context, next: ()=> Promise<any>) {
        const proxyOptions = devOptions.proxy || {};

        let needProxy = false;
        // 默认转发路径
        let pathProxy = {
            target: 'http://localhost:8080', // 默认转发的host
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