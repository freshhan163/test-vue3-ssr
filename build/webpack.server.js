'use strict'

const  { merge } = require('webpack-merge');
const webpack = require('webpack');
const baseConfig = require('./webpack.base');
const nodeExternals = require('webpack-node-externals');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');

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
    ],
});
