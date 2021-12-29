# Vue3 服务端渲染SSR项目实践文档

## 项目时间：2021.12.29

## 本项目依赖

## Vue3 + Vuex + Webpack5 + vue-bundle-renderer + Koa2
### 前端包依赖
* vue 3.2.21
* vue-bundle-renderer 0.3.4
* vue-router 4.0.12
* vuex 4.0.2
* vue-router-sync 5.0.0
* webpack 5.64.3
* webpack-dev-middelware 5.2.1
* webpack-hot-middleware 2.25.1

### 后端包依赖
* koa 2.13.4
* node > 12.22.0
* npm > 6.0.0

### 其他配置

支持husky、lint-staged、commit提交规范（```npm run commit```）

## 安装
```bash
npm i

npm run prepare # 安装husky钩子
```

## 启动
```bash
npm run start # 启动development环境（有热更新）

npm run server # 启动开发环境server

npm run server:prod # 启动生产环境server

npm run server:build # 先打包，然后启动生产环境server
```

## ssr相关内容解析

1.src/相关
* ```createSSRApp```：在vue3的ssr中，官方提供了该API，创建SSR项目时，直接用该API即可。[vue3SSR官方文档](https://v3.cn.vuejs.org/guide/ssr/structure.html#%E9%81%BF%E5%85%8D%E6%9C%89%E7%8A%B6%E6%80%81%E7%9A%84%E5%8D%95%E4%BE%8B%E6%A8%A1%E5%BC%8F)

* ```entry-server.ts```：服务端侧的入口文件

1）函数```_createApp```返回和客户端相同的内容。

2）从```ssrContext```参数获取当前路由的url，返回对应路由下的组件

3）由于组件模块采用的是异步加载，为了在服务端渲染时加载对应模块的css，需要将```initialChunkName```传递给```ssrContext```。

4）加载路由对应模块的```serverPrefetch```函数：服务端渲染前触发的ajax请求

5）将```store.state```传递给```ssrContext```，是为了后续```state```状态同步


2.webpack配置相关

* webpack配置支持ts：需要设置```tsconfig-for-webpack.json```，具体配置请参考[webpack5配置支持TS官方文档](https://www.webpackjs.com/configuration/configuration-languages/)
* vue-loader：直接使用vue-loader@16.x即可，不用再使用vue-loader-v16，请参照[vue-loader-v16官方文档](https://github.com/vuejs/vue-loader)
* webpack-manifest-plugin
    * 服务端manifest，改用库```webpack-manifest-plugin```
    * 客户端manifest，用自定义的插件```lib/client.plugin.ts```

3.dev环境启动项目时的打包配置——setup-dev-server.ts

* 提供devServer服务：```webpack-dev-middleware```

* 提供热更新服务：```webpack-hot-middleware```

* 提供webpack.devServer.historyApiFallback.rewrites服务

* 从内存中读取clientManifest文件

```javascript
readOutputFile(webpackDevMiddleware.context.outputFileSystem, VUE_SSR_CLIENT_MANIFEST)
```

* 为```createBundle()```提供bundle

```vue-bundle-renderer```库依赖于```bundle-runner```库，它提供API```createBundle(bundle, options)```。

1）```bundle```参数接受两种格式：```Partial<Bundle> | string```


```typescript
export declare type Bundle = {
    basedir: string;
    entry: string;
    files: {
        [filename: string]: string;
    };
    maps: {
        [filename: string]: string;
    };
};

export declare function createBundle(_bundle: Partial<Bundle> | string, options?: CreateBundleOptions): {
    bundle: Bundle;
    evaluateModule: import("./module").EvaluateModule;
    evaluateEntry: (context: object) => any;
    rewriteErrorTrace: (err: Error) => Promise<Error>;
};
```

由于```webpack.server.ts```采用的是```webpack-manifest-plugin```，打包后的```vue-ssr-server-manifest.json```文件内容和```createBundle(bundle, options)```bundle参数不一致，因此为了满足```createBundle(bundle, options)```API参数的要求，这里将bundle内容读取出来，作为string传入

```vue-ssr-server-manifest.json```文件内容

```json
{
  "app.js": "/server-bundle.js",
  "app.css": "/css/app.cbd05aaa.css",
  "server-bundle.js.map": "/server-bundle.js.map",
  "app.cbd05aaa.css.map": "/css/app.cbd05aaa.css.map"
}
```

```js
// 从内存读取文件夹
serverBundle = JSON.parse(readOutputFile(msf, VUE_SSR_SERVER_MANIFEST));

// 将bundle内容读取为字符串
serverBundle = readOutputFile(msf, SERVER_BUNDLE_JS);
```

当然也可以自己手写库，将返回的参数改造为符合```createBunlde(bunlde, options)```的格式。

4.server/app.ts
* node版本检查功能

* log日志功能：采用```log4js```库

* devProxy功能：采用```http-proxy-middleware```库

* 从chrome的 vue devtools中，直接打开.vue文件功能

* dev环境下ssr功能

* prod环境下dev功能

* 服务端和客户端渲染服务：判断客户端、还是服务端，且提供404/error的客户端渲染

5.dev环境下ssr功能——server/middleware/ssr-render-dev.ts

* 本项目使用的是0.3.2版本，需要添加```renderToString```、```bundleRunner```参数，否则会报错。
* ```rendererToString```返回的内容也有变化：返回的page包含html、renderResourceHints、renderStyles、renderScripts参数。

6.prod环境下dev功能

```test-vue3-ssr```项目使用的是```createBundleRenderer```API。

但[官方文档](https://v3.cn.vuejs.org/guide/ssr/server.html)中推荐的是直接从打包后的文件中获取```createApp```函数。不确定的是该API对分包的支持程度。

7.服务端和客户端渲染服务