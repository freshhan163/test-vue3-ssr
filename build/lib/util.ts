/**
 * @file util.ts
 * @desc webpack配置中的通用函数
 */
import path from 'path';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

export function cssLoader(options = { extract: false }) {
    const loaders: any[] = [{
        loader: 'css-loader',
        options: {
            importLoaders: 1
        },
    }, {
        loader: 'postcss-loader',
    }];

    loaders.unshift({loader: options.extract ? MiniCssExtractPlugin.loader : 'vue-style-loader' });
    return loaders;
}

export function scssLoader(options = { extract: false }) {
    return cssLoader(options).concat([{ loader: 'sass-loader' }]);
}

export function resolve(dir: string) {
    return path.join(__dirname, '..', dir);
}
