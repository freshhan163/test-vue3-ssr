'use strict'

const path = require('path');
const webpack = require('webpack');
const MSF = require('memory-fs');
const clientConfig = require('./webpack.client')();
const serverConfig = require('./webpack.server')();

const readOutputFile = (fs, file) => {
    try {
        return fs.readFileSync(path.join(clientConfig.output.path, file), 'utf-8');
    } catch (e) {}
};

module.exports = function setupDevServer(app, cb) {
    let serverBundle, clientManifest, ready;

    const readyPromise = new Promise((resolve) => {
        ready = resolve;
    });
    const update = () => {
        if (serverBundle && clientManifest) {
            ready();
            // 此处的serverBundle是server的bundle；clientManifest是客户端的manifest
            cb(serverBundle, { clientManifest });
        }
    };

    // 修改clientConfig
    clientConfig.entry.app = [
        'webpack-hot-middleware/client',
        clientConfig.entry.app
    ];
    clientConfig.output.filename = '[name].js';
    // 添加HotMiddleware
    clientConfig.plugins.push(new webpack.HotModuleReplacementPlugin());
    // 在打包完成后，获取资源，添加devMiddleware
    const clientCompiler = webpack(clientConfig);
    const devMiddleware = require('webpack-dev-middleware')(clientCompiler, {
        publicPath: '/dist/',
        stats: {
            colors: true,
            chunks: false
        }
    });
    // 服务端开启devMiddleware
    app.use(devMiddleware);

    // 获取客户端打包后的 client-manifest.json
    clientCompiler.hooks.done.tap('stats', (stats) => {
        stats = stats.toJson();

        stats.errors.forEach((err) => console.error(err));
        stats.warnings.forEach((err) => console.warn(err));
        if (stats.errors.length) return;

        // 从内存中读取clientManifest文件
        clientManifest = JSON.parse(
            readOutputFile(devMiddleware.context.outputFileSystem, 'vue-ssr-client-manifest.json')
        );
        update();
    });
    
    // 添加热更新替换
    app.use(
        require('webpack-hot-middleware')(clientCompiler, { heartbeat: 5000 })
    );

    // 打包server项目
    const serverCompiler = webpack(serverConfig);
    // 读取在内存中的文件
    const msf = new MSF();
    serverCompiler.outputFileSystem = msf;

    // 监听文件变更
    serverCompiler.watch({}, (err, stats) => {
        if (err) throw err;
        stats = stats.toJson();
        if (stats.errors.length) return;
    
        // 从内存读取文件夹
        serverBundle = JSON.parse(readOutputFile(msf, 'vue-ssr-server-bundle.json'));

        // 在webpack.server.js中，使用官方webpack-manifest-plugin时，需要将bundle的内容读取出来，否则就要用lib自定义的server.plugin.js
        serverBundle = readOutputFile(msf, 'server-bundle.js');
        
        update();
    });

    return readyPromise;
};
