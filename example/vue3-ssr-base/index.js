const express = require('express');
const server = express();

const { createSSRApp } = require('vue')
const { renderToString } = require('@vue/server-renderer');

server.get('*', async function(req, res) {
    const vueApp = createSSRApp({
        data() {
            return {
                user: 'Vue3@3.2.26'
            }
        },
        template: `<div>当前vue版本是: {{ user }}</div>`
    });
    const vueContent = await renderToString(vueApp);

    const html = `
        <html>
            <body>
            <h1>Vue3 SSR 渲染</h1>
            <div id="app">${vueContent}</div>
            </body>
        </html>
    `;
    res.send(html);
});

server.listen(3004, function() {
    console.log('http://localhost:3004');
});
