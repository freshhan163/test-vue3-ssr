/**
 * @file const.js
 * @desc 项目常量定义
 */
import path from 'path';

export const VUE_SSR_CLIENT_MANIFEST = 'vue-ssr-client-manifest.json';
export const VUE_SSR_SERVER_MANIFEST = 'vue-ssr-server-manifest.json';
export const SERVER_BUNDLE_JS = 'server-bundle.js';
export const CLIENT_HTML = 'client-template.html';

// 基础的webpack配置 
export const webpackConfig = {
    outputPath: path.resolve(__dirname, '../dist'), // 资源打包路径
    outputPublicPath: '/',  // 公共资源访问路径 CDN '//ali2.a.kwimgs.com/udata/pkg/cloudcdn/'
    clientTemplateHtml: path.resolve(__dirname, `../dist/${CLIENT_HTML}`) // 客户端html for 404 | error
};
