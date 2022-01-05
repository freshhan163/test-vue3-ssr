import { merge } from 'webpack-merge';
import baseConfig from './webpack.base';
import VueSSRClientPlugin from './lib/client.plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

// @ts-nocheck
export default env => merge<any>(baseConfig(env), {
    entry: {
        app: './src/entry-client'
    },
    devtool: env.prod ? 'hidden-source-map' : 'cheap-module-source-map',
    optimization: {
        minimize: env.prod,
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all'
                }
            }
        }
    },
    module: {
        rules: [
            {
                test: /\.(sa|sc|c)ss$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            publicPath: '/'
                        }
                    },
                    "css-loader",
                    "postcss-loader",
                    "sass-loader"
                ],
                exclude: /node_modules/
            }
        ]
    },
    plugins: [
        new VueSSRClientPlugin({ fileName: 'vue-ssr-client-manifest.json' }),
        new ForkTsCheckerWebpackPlugin({
            async: true, // 是否开启同步检查，将错误反馈给 webpack；为true表示异步反馈ts报错，不影响编译时间
            typescript: {
                configOverwrite: {
                    include: [
                        'src/**/*',
                        'types/**/*.d.ts'
                    ]
                },
                extensions: {
                    vue: {
                        enabled: true, // 开启支持.vue结尾文件的ts检查
                        compiler: 'vue/compiler-sfc' // 默认配置为'vue-template-compiler'，但vue3从3.2.13+版本已经已经启用vue/compiler-sfc
                    }
                }
            }
        })
    ]
});
