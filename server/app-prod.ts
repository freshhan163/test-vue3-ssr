const express = require('express');
const path = require('path');
const fs = require('fs');
const { renderToString } = require('vue/server-renderer');
const manifest = require("../dist/vue-ssr-server-bundle.json");

const server = new express();

// 使用createSSRApp：无法实时热更新
function ssrWithCreateSSRApp() {
    const serverBundlePath = path.join(__dirname, "../dist", manifest["app.js"]); // 拿到serverBundle
    const createApp = require(serverBundlePath).default; // 拿到entry-server.js文件中的 createApp函数
    return createApp();
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

server.get('*', async (req: any, res: any) => {
    const app = ssrWithCreateSSRApp();
    const page = await renderToString(app); // 此处的renderToString用的是vue/server-renderer

    const fileHtml = `
        <!DOCTYPE html>
            <html lang="en">
                <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>SSR Vue 3生产环境</title>
                </head>
                <body>
                <div id="app">${page}</div>
                </body>
            </html>
        `;

    // 渲染结果写入html
    fs.writeFile('rendered-prod-ssr.html', fileHtml, (err: any) => {
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
