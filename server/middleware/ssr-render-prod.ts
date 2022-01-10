/**
 * @file render-prod.ts
 * @desc production 模式下，ssr渲染
*/
import fs from 'fs';
import path from 'path';
import { renderToString } from 'vue/server-renderer';
import { createBundleRenderer } from 'vue-bundle-renderer';
import serialize from 'serialize-javascript';
import { VUE_SSR_CLIENT_MANIFEST, VUE_SSR_SERVER_MANIFEST, CLIENT_HTML, webpackConfig } from '../../config/const';
import { Context } from 'koa';
import { renderHtml } from './lib/renderTemplate';

// 客户端和服务端状态同步
function renderState(context) {
    const contextKey = 'state';
    const windowKey = '__INITIAL_STATE__';
    const state = serialize(context[contextKey]);
    // 代码强迫症, 为了保持生成的html整洁, 在数据同步之后删除script标签，也可以不加
    const autoRemove =
        ';(function(){var s;(s=document.currentScript||document.scripts[document.scripts.length-1]).parentNode.removeChild(s);}());';
    return context[contextKey] ? `<script>window.${windowKey}=${state}${autoRemove}</script>` : '';
}

let renderer;
let clientManifest;

// 读取打包后的文件，并调用createBundleRenderer
function ssrProdWithBundleRender() {
    const serverManifest = require(`${webpackConfig.outputPath}/${VUE_SSR_SERVER_MANIFEST}`);
    clientManifest = require(`${webpackConfig.outputPath}/${VUE_SSR_CLIENT_MANIFEST}`);
    const serverBundlePath = `${webpackConfig.outputPath}${serverManifest["app.js"]}`; // 拿到对应的serverBundle
    const serverBundle = fs.readFileSync(serverBundlePath, 'utf-8'); // 读取为string

    renderer = createBundleRenderer(
        serverBundle,
        {
            clientManifest,
            runInNewContext: false, // false则bundle代码将和服务器进程在同一个global上下文中运行，减少性能开销
            publicPath: webpackConfig.outputPublicPath,
            bundleRunner: require('bundle-runner'), // 一定要加
            renderToString,      // 一定要加，指定server-renderer函数
        }
    );
}

export default function ssrProd() {
    ssrProdWithBundleRender();
    return async function(context: Context, next: () => void) {
        const handleError = (err) => {
            context.status = 500;
            context.body = '500 | Internal Server Error';
            console.error(`error during render : ${context.url}`);
            console.error(err);
        };
    
        const requestContent = {
            url: context.url,
            initialChunkName: [] // 入口处的chunkName, 从 entry-server.ts的 ssrContext获取
        };
        context.serverRender = async () => {
            let page;
            try {
                page = await renderer.renderToString(requestContent);
            } catch (err) {
                handleError(err);
                return;
            }
            // page包含：html、renderResourceHints、renderStyles、renderScripts
            const { html, renderResourceHints, renderStyles, renderScripts } = page;
        
            let renderInitialChunkCss = '';
            // 将当前路径url 对应入口处的异步chunk.css，提前加载
            if (requestContent.initialChunkName.length > 0) {
                requestContent.initialChunkName.forEach(chunkName => {
                    const reg = new RegExp(`.*/${chunkName}\\..*\\.css$`, 'i');
                    clientManifest.async.some(file => {
                        if (reg.test(file)) {
                            renderInitialChunkCss += `<link rel="stylesheet" href="/${file}">\n`;
                            return true;
                        }
                    });
                });
            } else {
                // 兜底策略
                clientManifest.all.forEach(file => {
                    if (/\.css(\?[^.]+)?$/.test(file) && !clientManifest.initial.includes(file)) {
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
            return fileHtml;
        };

        context.clientRender = () => {
            return fs.readFileSync(webpackConfig.clientTemplateHtml, 'utf-8');;
        };
        await next();
    };
}
