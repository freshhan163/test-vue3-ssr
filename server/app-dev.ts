const express = require('express');
const path = require('path');
const fs = require('fs');
const { renderToString } = require('vue/server-renderer');
const { createBundleRenderer } = require('vue-bundle-renderer');
const manifest = require("../dist/vue-ssr-server-manifest.json");
const { createSSRApp } = require("vue");

const server = new express();

// 创建bundleRender
// function createRenderer(bundle, options) {
//     console.log('readyPromise内部执行 createRenderer  = ');
//     return createBundleRenderer(bundle, Object.assign({}, options, {
//         runInNewContext: false,
//         renderToString,
//         basedir: path.resolve(__dirname, './dist'),
//         publicPath: '/dist/',
//     }));
// }
// let renderer;
// const readyPromise = require('../build/setup-dev-server.js')(server, (bundle, options) => {
//     console.log('readyPromise内部执行 options = ', options);
//     renderer = createRenderer(bundle, options);
// });

// 使用createSSRApp

const appPath = path.join(__dirname, "../dist", manifest["app.js"]);
console.log('appPath =', appPath);
const createApp = require(appPath).default;
console.log('createApp =', createApp, createApp());

server.use("/img", express.static(path.join(__dirname, "../dist", "img")));
server.use("/js", express.static(path.join(__dirname, "../dist", "js")));
server.use("/css", express.static(path.join(__dirname, "../dist", "css")));
server.use(
  "/favicon.ico",
  express.static(path.join(__dirname, "../dist", "favicon.ico"))
);

// 静态文件处理
// server.use('/dist', express.static(path.resolve(__dirname, './dist'), {
//     maxAge: 0,
// }));

server.get('*', async (req: any, res: any) => {
    // res.setHeader('Content-Type', 'text/html');
    // res.send('text');

    console.log('路径 *');
    // 加载bundle，获取renderer
    // await readyPromise;
    // console.log('after readyPromise');

    const { app } = createApp();
    console.log('serverApp =', app);
    const page = await renderToString(app);

    const context = {
        url: req.url,
    };

    // let page;
    // try {
    //     page = await renderer.renderToString(context);
    // } catch (err) {
    //     res.status(500).send('500 | Internal Server Error');
    //     console.error(`error during render : ${req.url}`);
    //     console.error(err);
    // }
    // console.log('page = ', page);


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
    // console.log('html = ', html);
    fs.writeFile('rendered.html', html, (err: any) => {
        if (err) {
            throw err;
        }
    });

    // 返回html
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
});

server.listen(3001, () => {
    console.log('服务开启 port = ', 3001);
});
