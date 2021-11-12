'use strict'

const  { merge } = require('webpack-merge');
const webpack = require('webpack');
const baseConfig = require('./webpack.base');
const nodeExternals = require('webpack-node-externals');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const { VueSSRServerPlugin } = require('./lib/server.plugin');

module.exports = (env = {}) => merge(baseConfig(env), {
    target: 'node',
    entry: {
        app: './src/entry-sever'
    },
    output: {
        filename: 'server-bundle.js',
        libraryTarget: 'commonjs2'
    },
    externals: nodeExternals({
        allowlist: /\.css$/,
    }),
    plugins: [
        new webpack.optimize.LimitChunkCountPlugin({
            maxChunks: 1,
        }),
        new WebpackManifestPlugin({ fileName: 'vue-ssr-server-bundle.json' }),
        // new VueSSRServerPlugin() // 不用自定义的server plugin了，如果想用自定义的，需要修改 setup-dev-server.js的 bundle参数
    ],
});
