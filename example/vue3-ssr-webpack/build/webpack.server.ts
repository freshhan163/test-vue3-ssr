import webpack from 'webpack';
import { merge } from 'webpack-merge';
import baseConfig from './webpack.base';
import nodeExternals from 'webpack-node-externals';
import { WebpackManifestPlugin } from 'webpack-manifest-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

export default env => merge<any>(baseConfig(env), {
    target: 'node',
    entry: {
        app: './src/entry-server'
    },
    devtool: 'source-map',
    output: {
        filename: 'server-bundle.js',
        library: {
            type: 'commonjs2'
        }
    },
    externals: nodeExternals({
        allowlist: /\.(css|vue)$/
    }),
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
        new webpack.optimize.LimitChunkCountPlugin({
            maxChunks: 1
        }),
        new WebpackManifestPlugin({ fileName: 'vue-ssr-server-manifest.json' }) // 此处fileName， N是大写
    ]
});
