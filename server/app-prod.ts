namespace AppProd {
    const express = require('express');
    const path = require('path');
    const fs = require('fs');
    const { renderToString } = require('vue/server-renderer');
    const { createBundleRenderer } = require('vue-bundle-renderer');
    const serverManifest = require("../dist/vue-ssr-server-bundle.json");
    const favicon = require('serve-favicon');
    const serialize = require('serialize-javascript');

    const server = new express();

    // 使用createSSRApp：无法实现css等资源的加载
    async function ssrWithCreateSSRApp(context) {
        const serverBundlePath = path.join(__dirname, "../dist", serverManifest["app.js"]); // 拿到serverBundle
        const createApp = require(serverBundlePath).default; // 拿到entry-server.js文件中的 createApp函数
        return await createApp(context);
    }

    // 使用bundle渲染
    function createRenderer(bundle, options) {
        return createBundleRenderer(
            bundle,
            Object.assign(options, {
                runInNewContext: false,
                renderToString,      // 一定要加
                basedir: path.resolve(__dirname, '../dist'),
                publicPath: '/dist/', // 静态资源加载时的公共目录
                bundleRunner: require('bundle-runner') // 一定要加
            })
        );
    }

    let renderer;

    // 读取打包后的文件，并调用createBundleRenderer
    function ssrWithBundleRender() {
        const serverBundlePath = path.join(__dirname, "../dist", serverManifest["app.js"]); // 拿到serverBundle
        const serverBundle = fs.readFileSync(serverBundlePath, 'utf-8'); // 读取为string
        const clientManifest = require('../dist/vue-ssr-client-manifest.json');

        renderer = createRenderer(serverBundle, { clientManifest });
    }

    // 客户端和服务端状态同步
    function renderState(context) {
        const contextKey = 'state';
        const windowKey = '__INITIAL_STATE__';
        const state = serialize(context[contextKey]);
        const autoRemove =
            ';(function(){var s;(s=document.currentScript||document.scripts[document.scripts.length-1]).parentNode.removeChild(s);}());';
        const nonceAttr = context.nonce ? ' nonce="' + context.nonce + '"' : '';
        return context[contextKey] ? `<script${nonceAttr}>window.${windowKey}=${state}${autoRemove}</script>` : '';
    };

    // 静态文件渲染
    function staticRender() {
        server.use("/img", express.static(path.join(__dirname, "../dist", "img")));
        server.use("/js", express.static(path.join(__dirname, "../dist", "js")));
        server.use("/css", express.static(path.join(__dirname, "../dist", "css")));
        server.use('/dist', express.static(path.resolve(__dirname, '../dist'), {
            maxAge: 0
        }));
    }

    server.use(favicon('./public/favicon.ico'));
    staticRender();

    // 采用BundleRender渲染
    server.get('*', async (req: any, res: any) => {
        ssrWithBundleRender();
        const context = {
            url: req.url,
        };

        let page;
        try {
            page = await renderer.renderToString(context);
        } catch (err) {
            res.status(500).send('500 | Internal Server Error');
            console.error(`error during render : ${req.url}`);
            console.error(err);
            return;
        }
        // page包含：html、renderResourceHints、renderStyles、renderScripts
        const { html, renderResourceHints, renderStyles, renderScripts } = page;

        const fileHtml = `
            <!DOCTYPE html>
                <html lang="en">
                    <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    ${renderResourceHints()}
                    ${renderStyles()}
                    <title>SSR Vue 3本地环境</title>
                    </head>
                    <body>
                    <div id="app">${html}</div>
                    ${renderScripts()}
                    ${renderResourceHints()}
                    ${renderState(context)}
                    </body>
                </html>
            `;

        // 渲染结果写入html
        fs.writeFile('rendered-dev-ssr.html', fileHtml, (err: any) => {
            if (err) {
                throw err;
            }
        });

        // 返回html
        res.setHeader('Content-Type', 'text/html');
        res.send(fileHtml);
    });

    // createSSRApp模式：拿不到css等文件渲染
    // server.get('*', async (req: any, res: any) => {
    //     const context = {
    //         url: req.url,
    //     };
    //     const app = await ssrWithCreateSSRApp(context);
    //     const page = await renderToString(app); // 此处的renderToString用的是vue/server-renderer

    //     const fileHtml = `
    //         <!DOCTYPE html>
    //             <html lang="en">
    //                 <head>
    //                 <meta charset="UTF-8">
    //                 <meta name="viewport" content="width=device-width, initial-scale=1.0">
    //                 <title>SSR Vue 3生产环境</title>
    //                 </head>
    //                 <body>
    //                 <div id="app">${page}</div>
    //                 </body>
    //             </html>
    //         `;

    //     // 渲染结果写入html
    //     fs.writeFile('rendered-prod-ssr.html', fileHtml, (err: any) => {
    //         if (err) {
    //             throw err;
    //         }
    //     });

    //     // 返回html
    //     res.setHeader('Content-Type', 'text/html');
    //     res.send(fileHtml);
    // });

    const port = 3001;
    server.listen(port, () => {
        console.log('服务开启 请访问', `http://localhost:${port}`);
    });

}
