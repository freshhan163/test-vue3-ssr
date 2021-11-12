'use strict'

const { merge } = require('webpack-merge');
const baseConfig = require('./webpack.base');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const { VueSSRClientPlugin } = require('./lib/client.plugin'); 

module.exports = (env = {}) => merge(baseConfig(env), {
    entry: {
        app: './src/entry-client'
    },
    output: {
        publicPath: '/dist/'
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all',
                }
            }
        }
    },
    plugins: [
        // new WebpackManifestPlugin({
        //     fileName: 'vue-ssr-client-manifest.json',
            // generate: (seed, files, entries) => {
            //     console.log('generate file = ', files, 'entries =', entries);
            //     return files.reduce((manifest, file) => {
            //         console.log('manifest = ', manifest);
            //         console.log('file = ', file);
            //         return Object.assign(manifest, { [file.name]: file.path, test: 'hxf' });
            //     }, seed);
            // }
        // }),
        new VueSSRClientPlugin({ fileName: 'vue-ssr-client-manifest.json' })
    ]
});
