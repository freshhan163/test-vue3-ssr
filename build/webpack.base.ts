import webpack from 'webpack';
import path from 'path';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { VueLoaderPlugin } from 'vue-loader';
import { webpackConfig } from '../config/const';

export default (env = { prod: false }) => ({
    cache: false,
    mode: env.prod ? 'production' : 'development',
    output: {
        path: webpackConfig.outputPath,
        publicPath: webpackConfig.outputPublicPath,
        filename: env.prod ? 'js/[name].[fullhash].js' : 'js/[name].js',
        chunkFilename: env.prod ? 'js/[name].[fullhash].js' : 'js/[name].js'
    },
    resolve: {
        extensions: ['.vue', '.ts', '.js', '.jsx', '.scss', '.css', '.json', '.wasm'],
        alias: {
            '@': path.resolve(__dirname, '../src'),
            vue: 'vue/dist/vue.runtime.esm-bundler.js'
        }
    },
    module: {
        noParse: /es6-promise\.js$/, // avoid webpack shimming process
        rules: [
            {
                test: /\.vue$/,
                use: [
                    {
                        loader: 'vue-loader',
                        options: {
                            extractCSS: env.prod, // CSS 提取应该只用于生产环境，以便在开发过程中仍然可以热重载
                            hotReload: !env.prod // 热更新，默认开发环境会自动开启，但在webpack.server.ts中由于target = 'node', hotReload会自动关闭，所以此处手动开启
                        }
                    }
                ],
                include: [ path.join(__dirname, '../src') ]
            },
            {
                test: /\.tsx?$/,
                use: [
                    { loader: 'babel-loader' },
                    {
                        loader: 'ts-loader',
                        options: {
                            appendTsSuffixTo: [/\.vue$/],
                            transpileOnly: true // 关闭当前线程中的ts类型检查，即只进行转译，将ts类型检查交给fork-ts-checker
                        }
                    }
                ],
                include: [ path.join(__dirname, '../src') ]
            },
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader'
                },
                exclude: /node_modules/
            },
            {
                test: /\.(?:ico|gif|png|jpg|jpeg|webp|svg)$/i,
                type: 'asset',
                parser: {
                    dataUrlCondition: {
                        maxSize: 10 * 1024 // 10kb
                    }
                },
                generator: {
                    filename: 'images/[hash][ext][query]'
                }
            }
        ]

    },
    optimization: {
        minimize: env.prod
    },
    plugins: [
        new webpack.DefinePlugin({
            __VUE_OPTIONS_API__: 'true',
            __VUE_PROD_DEVTOOLS__: 'false'
        }),
        new VueLoaderPlugin(),
        new MiniCssExtractPlugin({
            filename: env.prod ? 'css/[name].[contenthash:8].css' : 'css/[name].css',
            chunkFilename: env.prod ? 'css/[name].[contenthash:8].chunk.css' : 'css/[name].chunk.css'
        })
    ]
});
