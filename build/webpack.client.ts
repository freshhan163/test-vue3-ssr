import { merge } from 'webpack-merge';
import baseConfig from './webpack.base';
import VueSSRClientPlugin from './lib/client.plugin';
import { VUE_SSR_CLIENT_MANIFEST, CLIENT_HTML } from '../config/const';
import { scssLoader } from './lib/util';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';
import webpack from 'webpack';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';

// @ts-nocheck
export default env => merge<any>(baseConfig(env), {
    entry: {
        app: './src/entry-client'
    },
    devtool: env.prod ? false : 'eval-cheap-module-source-map',
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
                use: scssLoader({ extract: true }) // prod模式下，才提取css为单独的文件
            }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'production'),
                VUE_ENV: JSON.stringify('client')
            }
        }),
        // build for SPA
        new HtmlWebpackPlugin({
            filename: CLIENT_HTML,
            template: path.resolve(__dirname, '../public/client-template.html')
        }),
        new VueSSRClientPlugin({ fileName: VUE_SSR_CLIENT_MANIFEST }),
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
