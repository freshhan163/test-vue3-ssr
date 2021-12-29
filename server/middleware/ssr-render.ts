/**
 * @file ssr-render.ts1
 * @desc 统一管理 render相关路由：根据请求判断是返回 clientRender 还是 serverRender
 */
import Koa from 'koa';
const staticRenderPath = ['/404', '/error']; // 直接匹配客户端html的网页：减少服务器压力

export default async (ctx: Koa.Context, next: ()=> void) => {
    ctx.render = async () => {
        if ('csr' in ctx.query || staticRenderPath.includes(ctx.path)) {
            console.log('客户端渲染client render path  =', ctx.path);
            ctx.body = ctx.clientRender();
            ctx.type = 'text/html';
            ctx.status = 200;
            return;
        }
        console.log('服务端渲染 render path  =', ctx.path);
        ctx.body = await ctx.serverRender();
        ctx.status = ctx.status || 200;
    };
    await next();
};
