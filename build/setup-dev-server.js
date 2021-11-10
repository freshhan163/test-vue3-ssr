'use strict'

const path = require('path');
const webpack = require('webpack');
const MSF = require('memory-fs');
const clientConfig = require('./webpack.client')();
const serverConfig = require('./webpack.server')();
const fs = require('fs');

const readOutputFile = (fs, file) => {
    try {
        // console.log('path =', path.join(clientConfig.output.path, file));
        // const data = fs.readFileSync(path.join(clientConfig.output.path, file), 'utf-8');
        // console.log('data =', data);
        // return data;
        return fs.readFileSync(path.join(clientConfig.output.path, file), 'utf-8');
    } catch (e) {}
};

module.exports = function setupDevServer(app, cb) {
    console.log('执行 setupDevServer');
    let bundle, clientManifest, ready;

    const readyPromise = new Promise((resolve) => {
        ready = resolve;
    });
    const update = () => {
        if (bundle && clientManifest) {
            ready();
            console.log('执行callback函数');
            // 此处的bundle是server的bundle；clientManifest是客户端的manifest
            cb(bundle, { clientManifest });
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

        clientManifest = JSON.parse(
            readOutputFile(devMiddleware.context.outputFileSystem, 'vue-ssr-client-manifest.json')
        );
        // console.log('clientManifest =', clientManifest);
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
        console.log('服务端 监听文件变更');
        if (err) throw err;
        stats = stats.toJson();
        if (stats.errors.length) return;
    
        bundle = JSON.parse(readOutputFile(msf, 'vue-ssr-server-bundle.json'));
        console.log('服务端bundle =', Object.keys(bundle));
        
        update();
    });

    return readyPromise;
};
