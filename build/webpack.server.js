const  { merge } = require('webpack-merge');
const webpack = require('webpack');
const baseConfig = require('./webpack.base');
const nodeExternals = require('webpack-node-externals');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const path = require('path');

module.exports = (env = {}) => merge(baseConfig(env), {
    entry: {
        app: './src/entry-sever.js'
    },
    target: 'node',
    output: {
        filename: 'server-bundle.js',
        libraryTarget: 'commonjs2'
    },
    externals: nodeExternals({
        // do not externalize CSS files in case we need to import it from a dep
        allowlist: /\.css$/,
    }),
    plugins: [
        new webpack.optimize.LimitChunkCountPlugin({
            maxChunks: 1,
        }),
        new WebpackManifestPlugin({ fileName: 'vue-ssr-server-manifest.json' })
    ],
});
