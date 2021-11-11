import { createSSRApp } from "vue";
const express = require('express');
const path = require('path');
const fs = require('fs');
const { renderToString } = require('vue/server-renderer');
const { createBundleRenderer } = require('vue-bundle-renderer');

const server = new express();

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
    renderer = createRenderer(bundle, options);
});

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

server.get('*', async (req: any, res: any) => {
    await readyPromise;

    const context = {
        url: req.url,
    };

    let page;
    try {
        page = await renderer.renderToString(context); // 此处的renderToSting 和 prod模式下的不同之处????
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

const port = 3001;
server.listen(port, () => {
    console.log('服务开启 请访问', `http://localhost:${port}`);
});
