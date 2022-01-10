/**
 * @file render-dev.ts
 * @desc development模式下，ssr渲染
*/
import { renderToString } from 'vue/server-renderer';
import { createBundleRenderer } from 'vue-bundle-renderer';
import serialize from 'serialize-javascript';
import setupDevServer from '../build/setup-dev-server';
import { Context } from 'koa';
import { renderHtml } from './lib/renderTemplate';

const startupStatus = {
    hmtIsConnected: false,
    clientManifest: undefined
};

// 客户端和服务端状态同步
function renderState(context) {
    const contextKey = 'state';
    const windowKey = '__INITIAL_STATE__';
    const state = serialize(context[contextKey]);
    // 代码强迫症, 为了保持生成的html整洁, 在数据同步之后删除script标签，也可以不加
    const autoRemove
        = ';(function(){var s;(s=document.currentScript||document.scripts[document.scripts.length-1]).parentNode.removeChild(s);}());';
    return context[contextKey] ? `<script>window.${windowKey}=${state}${autoRemove}</script>` : '';
}

let readyPromise, renderer;

// dev模式下，webpack打包构建
function ssrDevWithBundleRender(server) {
    readyPromise = setupDevServer(server, (bundle, options) => {
        // TODO:暂时兼容性修复 webpack5 currentUpdate is undefined的bug; 新增异步模块的时候，可能会失效，等webpack5修复bug后再改
        if (!startupStatus.hmtIsConnected) {
            startupStatus.clientManifest = options.clientManifest;
            startupStatus.hmtIsConnected = true;
        }
        renderer = createBundleRenderer(
            bundle,
            Object.assign(options, {
                runInNewContext: false, // false则bundle代码将和服务器进程在同一个global上下文中运行，减少性能开销
                publicPath: '/', // 静态资源加载时的公共目录
                bundleRunner: require('bundle-runner'), // 一定要加
                renderToString, // 一定要加，指定server-renderer函数
                clientManifest: startupStatus.clientManifest
            })
        );
    });
}

export default function ssrDev(app) {
    ssrDevWithBundleRender(app);
    return async function (context: Context, next: ()=> void) {
        const requestContent = {
            url: context.url,
            initialChunkName: [] // 入口处的chunkName, 从 entry-server.ts的 ssrContext获取
        };
        await readyPromise;

        const handleError = err => {
            console.error(`error during render : ${context.url}`);
            console.error(err);
            context.type = 'text/plain';
            context.body = '500 | Internal Server Error';
            context.status = 500;
        };
        let page;
        try {
            page = await renderer.renderToString(requestContent);
        } catch (err) {
            handleError(err);
            return;
        }
        // page包含：html、renderResourceHints、renderStyles、renderScripts
        // html: 生成的html内容
        // renderResourceHints: 返回当前要渲染的页面，所需的 <link rel="preload/prefetch"> 资源提示 (resource hint)
        // renderStyles: 返回内联 <style> 标签包含所有关键 CSS(critical CSS) 
        // renderScripts: 返回引导客户端应用程序所需的 <script> 标签
        const { html, renderResourceHints, renderStyles, renderScripts } = page;

        // 将当前路径url 对应入口处的异步chunk.css，提前加载
        let renderInitialChunkCss = '';
        if (requestContent.initialChunkName.length > 0) {
            requestContent.initialChunkName.forEach(chunkName => {
                if (startupStatus.clientManifest.async.includes(`css/${chunkName}.chunk.css`)) {
                    renderInitialChunkCss += `<link rel="stylesheet" href="/css/${chunkName}.chunk.css">\n`;
                }
            });
        } else {
            // 兜底策略：当前路径下 没有异步chunk的时候，将所有的css全部preload进去
            startupStatus.clientManifest.all.forEach(file => {
                if (/\.css(\?[^.]+)?$/.test(file) && !startupStatus.clientManifest.initial.includes(file)) {
                    renderInitialChunkCss += `<link rel="stylesheet" href="/${file}">`;
                }
            });
        }

        const fileHtml = renderHtml({
            META_ATTRS: '',
            TITLE_NAME: '服务端渲染',
            HEAD_RESOURCE_ATTRS: `${renderResourceHints()} \n ${renderStyles()} \n ${renderInitialChunkCss}`,
            APP_ATTRS: html,
            BODY_RESOURCE_ATTRS: renderScripts(),
            STATE_ATTRS: renderState(requestContent)
        });

        context.body = fileHtml;
        context.status = 200;

        await next();
    };
}
