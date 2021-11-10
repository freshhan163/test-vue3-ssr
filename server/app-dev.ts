import { createApp } from 'vue';
const express = require('express');
const path = require('path');
const fs = require('fs');
const { renderToString } = require('vue/server-renderer');
const { createBundleRenderer } = require('vue-bundle-renderer');
const manifest = require("../dist/vue-ssr-server-bundle.json");

const server = new express();

// 使用createSSRApp：无法实时热更新
function ssrWithCreateSSRApp() {
    const serverBundlePath = path.join(__dirname, "../dist", manifest["app.js"]);
    console.log('serverBundlePath =', serverBundlePath);
    const createApp = require(serverBundlePath).default;
    const ssrApp = createApp();
    // console.log('ssrApp =', ssrApp)
    return ssrApp;
}

// /bundle路径渲染
let renderer, readyPromise;
function createRenderer(bundle, options) {
    return createBundleRenderer(bundle, Object.assign({}, options, {
        runInNewContext: false,
        renderToString,      // 一定要加
        basedir: path.resolve(__dirname, '../dist'),
        publicPath: '/',
        bundleRunner: require('bundle-runner') // 一定要加
    }));
}

readyPromise = require('../build/setup-dev-server.js')(server, (bundle, options) => {
    console.log('readyPromise内部执行 options = ', options);
    // renderer = createRenderer(bundle, options);
    // renderer = createRenderer(bundle.files['server-bundle.js'], options);
    
    console.log('bundle =', bundle);
    renderer = createRenderer(bundle, options);
});

function ssrWithCreateSSRAppDev() {
    let renderer;
    const readyPromise = require('../build/setup-dev-server.js')(server, (bundle, options) => {
        console.log('readyPromise内部执行 options = ', options);
        // console.log('bundle = ', bundle[])
        const serverBundlePath = path.join(__dirname, "../dist", manifest["app.js"]);
        const createApp = require(serverBundlePath).default;
        renderer = createApp();

        // renderer = createRenderer(bundle, options);
    });
    return {
        readyPromise,
        renderer
    };
    // await readyPromise;
    // return ssrApp;
}

function staticRender() {
    server.use("/img", express.static(path.join(__dirname, "../dist", "img")));
    server.use("/js", express.static(path.join(__dirname, "../dist", "js")));
    server.use("/css", express.static(path.join(__dirname, "../dist", "css")));
    server.use("/favicon.ico", express.static(path.join(__dirname, "../dist", "favicon.ico")));
    
    // 静态文件处理
    server.use('/dist', express.static(path.resolve(__dirname, '../dist'), {
        maxAge: 0,
    }));
}

staticRender();

server.get('/ssr', async (req: any, res: any) => {
    console.log('路径 /ssr 用createSSRApp渲染');

    const app = ssrWithCreateSSRApp();
    const page = await renderToString(app);

    const html = `
        <!DOCTYPE html>
            <html lang="en">
                <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>SSR Vue 3</title>
                </head>
                <body>
                <div id="app">${page}</div>
                </body>
            </html>
        `;

    // 渲染结果写入html
    fs.writeFile('rendered-ssr.html', html, (err: any) => {
        if (err) {
            throw err;
        }
    });

    // 返回html
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
});

server.get('/bundle', async (req: any, res: any) => {
    console.log('*****************路径 /bundle 用createBundleRender渲染*******************');
    // 加载bundle，获取renderer
    // const { readyPromise, renderer } = ssrWithBundleRenderer();
    await readyPromise;
    // console.log('after readyPromise renderer =', renderer);

    // const {renderer, readyPromise } = ssrWithCreateSSRAppDev();
    // await readyPromise;

    const context = {
        url: req.url,
    };
    // console.log('context =', context);

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
    console.log('page =', page.renderStyles());

    const fileHtml = `
        <!DOCTYPE html>
            <html lang="en">
                <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                ${renderResourceHints()}
                ${renderStyles()}
                <title>SSR Vue 3</title>
                </head>
                <body>
                <div id="app">${html}</div>
                ${renderScripts()}
                ${renderResourceHints()}
                </body>
            </html>
        `;

    // 渲染结果写入html
    fs.writeFile('rendered-bundle.html', html, (err: any) => {
        if (err) {
            throw err;
        }
    });

    // 返回html
    res.setHeader('Content-Type', 'text/html');
    res.send(fileHtml);
});

const port = 3001;
server.listen(port, () => {
    console.log('服务开启 请访问', `http://localhost:${port}`);
});
