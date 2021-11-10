const { merge } = require('webpack-merge');
const baseConfig = require('./webpack.base');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');

module.exports = (env = {}) => merge(baseConfig(env), {
    entry: {
        app: './src/entry-client.js'
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
        new WebpackManifestPlugin({ fileName: 'vue-ssr-client-manifest.json' })
    ]
});
