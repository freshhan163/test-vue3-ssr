# 项目文档

## 安装
```bash
npm install
```

## 启动
```bash
npm run server # 启动development环境（有热更新）

npm run server:prod # 启动生产环境（每次启动都会先打包，再启动）
```

## TODO
目前只是简单的搭建了开发环境、生产环境下的ssr框架，还有很多需要完善的地方。

1.css、js等文件的引入

2.项目添加router、vuex等（将国睿的src/同步过来）

3.ssr添加vuex、router等的信息同步

4.分包（启动每个项目的时候，只加载对应的vuex信息）

5.数据缓存

## 项目目录

## 内容解析
## 相比pc-live-next项目的升级点
1.src/相关
* ```createSSRApp```：在vue3的ssr中，官方提供了该API，创建SSR项目时，直接用该API即可。[官方文档](https://v3.cn.vuejs.org/guide/ssr/structure.html#%E9%81%BF%E5%85%8D%E6%9C%89%E7%8A%B6%E6%80%81%E7%9A%84%E5%8D%95%E4%BE%8B%E6%A8%A1%E5%BC%8F)

2.webpack配置相关
* vue-loader：直接使用vue-loader@16.x即可，不用再使用vue-loader-v16
* webpack-manifest-plugin：不需再引用lib/server.plugin和 client.plugin，改成用库```webpack-manifest-plugin```
    * 但要注意 ```webpack-manifest-plugin```打包生成后的内容和手写库```lib/```，打包生成后的内容是不一致的，所以在```setup-dev-server.js```文件中，引用```bundle```和```client-manifest```时，需要修改一下。

3.setup-dev-server.js

由于包版本号的升级，导致一些API有些变化。

* 从内存中读取clientManifest文件

```javascript
// pc-live-next项目
readOutputFile(devMiddleware.outputFileSystem, 'vue-ssr-client-manifest.json')
// 本项目
readOutputFile(devMiddleware.context.outputFileSystem, 'vue-ssr-client-manifest.json')
```

* 从内存中读取serverBundle

```vue-bundle-renderer```库依赖于```bundle-runner```库，```createBundle(bundle, options)```的```bundle```参数是指server打包后的bundle，该```bundle```接收的格式有两种：```Partial<Bundle> | string```

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

由于```webpack.server.js```文件中，```pc-live-next```项目用的是自定义的```serverPlugin```，打包后的```vue-ssr-server-bundle.json```文件内容和```createBundle(bundle, options)```bundle一致，因此只需要将```vue-ssr-server-bundle.json```的内容读取出来即可。

```pc-live-next```项目返回的```vue-ssr-server-bundle.json```

```json
{
    "entry": "server-bundle.js",
    "files": {
        "server-bundle.js": "打包后的内容"
    },
    "maps": {}
}
```

```js
// pc-live-next项目中 对bundle的处理
bundle = JSON.parse(readOutputFile(msf, 'vue-ssr-server-bundle.json'));
```


但本项目中server打包时用了官方的```webpack-manifest-plugin```，它仅仅返回文件的对应位置，不包括具体内容，如下所示

```webpack-manifest-plugin```插件返回的```vue-ssr-server-bundle.json```
```json
{
  "app.js": "/server-bundle.js",
  "app.css": "/css/app.24c63f02.css"
}
```

为了满足```createBundle(bundle, options)```API参数的要求，这里将bundle内容读取出来，作为string传入：

```js
serverBundle = JSON.parse(readOutputFile(msf, 'vue-ssr-server-bundle.json'));

serverBundle = readOutputFile(msf, 'server-bundle.js');
```

当然也可以使用自己写的库，但我看[Vue3 SSR官网](https://v3.cn.vuejs.org/guide/ssr/build-config.html#%E5%92%8C%E5%AE%A2%E6%88%B7%E7%AB%AF%E6%9E%84%E5%BB%BA%E7%89%88%E6%9C%AC%E7%9A%84%E5%85%B3%E9%94%AE%E4%B8%8D%E5%90%8C)推荐的是该库，所以就直接使用了官方插件```webpack-manifest-plugin```。

4.app-dev.ts

由于两个项目使用的```vue-bundle-renderer```版本号不一致，因此API的参数有些变化：

* 本项目使用的是0.3.2版本，需要添加```renderToString```、```bundleRunner```参数，否则会报错。
* ```rendererToString```返回的内容也有变化：返回的page包含html、renderResourceHints、renderStyles、renderScripts参数。

5.app-prod.ts

```pc-live-next```项目使用的是```createBundleRenderer```API。

但[官方文档](https://v3.cn.vuejs.org/guide/ssr/server.html)中推荐的是直接从打包后的文件中获取```createApp```函数。不确定的是该API对分包的支持程度。

