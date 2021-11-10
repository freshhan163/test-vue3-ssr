'use strict'

const webpack = require('webpack');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { VueLoaderPlugin } = require('vue-loader');

module.exports = (env = {}) => ({
    mode: env.prod ? 'production' : 'development',
    output: {
        path: path.resolve(__dirname, '../dist/'),
        publicPath: '/',
        filename: env.prod ? '[name].[hash].js' : '[name].js'
    },
    resolve: {
        alias: {
            vue: 'vue/dist/vue.runtime.esm-bundler.js'
        }
    },
    module: {
        noParse: /es6-promise\.js$/, // avoid webpack shimming process
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        envName: env.prod ? 'prod' : 'dev',
                    },
                },
            },
            {
                test: /\.vue$/,
                use: [
                    {
                        loader: require.resolve('vue-loader'),
                    },
                ],
            },
            {
                test: /\.tsx?$/,
                use: [
                    { loader: 'babel-loader' },
                    {
                        loader: 'ts-loader',
                        options: {
                            appendTsSuffixTo: [/\.vue$/],
                            transpileOnly: true, // 关闭当前线程中的ts类型检查，即只进行转译，将ts类型检查交给fork-ts-checker
                        }
                    }
                ],
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: [
                    process.env.NODE_ENV !== 'production'
                        ? 'vue-style-loader'
                        : MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: { importLoaders: 1 }
                    },
                    "postcss-loader",
                ],
                exclude: /node_modules/
                // 此处不可添加 exclude: /node_modules/, 否则 build:onlindist 命令，会报错，报在 /node_modules/@ks/sharp-ui/lib/themes/default/
            },
            {
                test: /\.(?:ico|gif|png|jpg|jpeg|webp|svg)$/i,
                use: {
                    loader: 'url-loader',
                    options: { limit: 8192 },
                },
            },
        ]

    },
    optimization: {
        minimize: env.prod ? true : false
    },
    plugins: [
        new webpack.DefinePlugin({
            __VUE_OPTIONS_API__: 'true',
            __VUE_PROD_DEVTOOLS__: 'false',
        }),
        new MiniCssExtractPlugin({
            filename: env.prod ? 'css/[name].[contenthash:8].css' : '[name].css',
            chunkFilename: env.prod
              ? 'css/[name].[contenthash:8].chunk.css'
              : '[name].chunk.css',
        }),
        new VueLoaderPlugin()
    ]
});
