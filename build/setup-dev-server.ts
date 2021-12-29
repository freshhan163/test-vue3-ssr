/**
 * @file setup-dev-server.ts
 * @desc development模式下 webpack的打包和热更新
 */
import path from 'path';
import { Context } from 'koa';
import webpack from 'webpack';
import MSF from 'memory-fs';
import clientWebpackConfigGenerator from './webpack.client';
import serverWebpackConfigGenerator from './webpack.server';
import { VUE_SSR_CLIENT_MANIFEST, VUE_SSR_SERVER_MANIFEST, SERVER_BUNDLE_JS, CLIENT_HTML } from '../config/const';
import c2k from 'koa-connect';
import wrapMiddleware from './lib/wrapMiddleware';

const env = {
    prod: false
};

export default function setupDevServer(app, cb) {
    const clientConfig = clientWebpackConfigGenerator(env);
    const serverConfig = serverWebpackConfigGenerator(env);

    const readOutputFile = (fs, file) => {
        try {
            return fs.readFileSync(path.join(clientConfig.output.path, file), 'utf-8');
        } catch (e) {
            console.log(e);
        }
    };

    let serverBundle; let clientManifest; let ready; let clientTemplate;

    const readyPromise = new Promise(resolve => {
        ready = resolve;
    });
    const update = () => {
        if (serverBundle && clientManifest) {
            ready();
            // 此处的serverBundle是server的bundle；clientManifest是客户端的manifest
            cb(serverBundle, { clientManifest }, clientTemplate);
        }
    };

    // 修改clientConfig
    clientConfig.entry.app = [
        clientConfig.entry.app,
        'webpack-hot-middleware/client?path=/__webpack_hmr&reload=true' // bundle重新构建时接收到通知，然后更新客户端的bundle
    ];

    // 添加HotMiddleware
    clientConfig.plugins.push(new webpack.HotModuleReplacementPlugin());

    // 在打包完成后，获取资源，添加devMiddleware
    const clientCompiler = webpack(clientConfig);
    const webpackDevMiddleware = require('webpack-dev-middleware')(clientCompiler, {
        publicPath: '/',
        stats: {
            colors: true,
            chunks: false
        },
        serverSideRender: false // serverSideRender默认为undefined，为true时，会将打包后的stats直接挂载到 res.locals.webpack.devMiddleware.context.stats
        // writeToDisk: (filePath) => { // 本地开发测试使用
        //     return true; 
        // }
    });
    // 服务端开启devMiddleware
    const devMiddleware = wrapMiddleware(clientCompiler, webpackDevMiddleware);
    app.use(devMiddleware);

    // 解决hot-update.json 404问题；对应webpack.devServer.historyApiFallback.rewrites 解决方案有2种：
    // 1.客户端src/route下，添加*的路由匹配
    // 2.在devMiddleware后，添加这段代码
    app.context.rewrites = [
        {
            from: '/app', // /app对应入口名
            to: '/' // 默认回退页面
        }
    ];
    app.use((context: Context, next: ()=> void) => {
        const rewrites = app.context.rewrites;
        for (let i = 0; i < rewrites.length; i++) {
            const match = context.url.match(rewrites[i].from);
            if (match !== null) {
                context.url = '/';
                return next();
            }
        }
        return next();
    });

    // 获取客户端打包后的 client-manifest.json
    clientCompiler.hooks.done.tap('stats', (stats: any) => {
        stats = stats.toJson();

        stats.errors.forEach(err => console.error(err));
        stats.warnings.forEach(err => console.warn(err));
        if (stats.errors.length) {
            return;
        }

        // 从内存中读取clientManifest文件
        clientManifest = JSON.parse(
            readOutputFile(webpackDevMiddleware.context.outputFileSystem, VUE_SSR_CLIENT_MANIFEST)
        );
        // 读取客户端html文件
        clientTemplate = readOutputFile(webpackDevMiddleware.context.outputFileSystem, CLIENT_HTML);
        update();
    });

    // 添加热更新替换
    const hotMiddleware = require('webpack-hot-middleware')(clientCompiler, { heartbeat: 5000, reload: true });
    app.use(c2k(hotMiddleware));

    // 打包server项目
    const serverCompiler = webpack(serverConfig);
    // 读取在内存中的文件
    const msf = new MSF();
    (serverCompiler as any).outputFileSystem = msf;

    // 监听文件变更
    serverCompiler.watch({}, (err, stats: any) => {
        if (err) {
            throw err;
        }
        stats = stats.toJson();
        if (stats.errors.length) {
            return;
        }
        // 从内存读取文件夹
        serverBundle = JSON.parse(readOutputFile(msf, VUE_SSR_SERVER_MANIFEST));

        // 在webpack.server.js中，使用官方webpack-manifest-plugin时，需要将bundle的内容读取出来，否则就要用lib自定义的server.plugin.js
        serverBundle = readOutputFile(msf, SERVER_BUNDLE_JS);
        update();
    });

    return readyPromise;
}
