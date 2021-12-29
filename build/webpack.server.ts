import webpack from 'webpack';
import { merge } from 'webpack-merge';
import baseConfig from './webpack.base';
import nodeExternals from 'webpack-node-externals';
import { WebpackManifestPlugin } from 'webpack-manifest-plugin';
import { VUE_SSR_SERVER_MANIFEST, SERVER_BUNDLE_JS } from '../config/const';
import { scssLoader } from './lib/util';

export default env => merge<any>(baseConfig(env), {
    target: 'node',
    entry: {
        app: './src/entry-server'
    },
    devtool: 'source-map',
    output: {
        filename: SERVER_BUNDLE_JS,
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
                use: scssLoader({ extract: true })
            }
        ]
    },
    plugins: [
        new webpack.optimize.LimitChunkCountPlugin({
            maxChunks: 1
        }),
        new WebpackManifestPlugin({ fileName: VUE_SSR_SERVER_MANIFEST }) // 此处fileName， N是大写
    ]
});
