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
### dev环境打包
### prod环境打包
