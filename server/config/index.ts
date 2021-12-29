/**
 * @file index.ts 
 * @desc 配置集合，process.env.NODE_ENV通过外部设置
 */
import path from 'path';

interface Config {
    port: number;
    defaultProxyServer: string;
    appPath: string;
    staticPath: string;
    proxy: {
        requestTimeout: number;
        API: {
            [propName: string]: string[];
        }
    }
}

const env = process.env.NODE_ENV;

// 对应原graphql_server服务，需要区分 dev | test | production
const defaultProxyHost = {
    development: 'http://localhost:3500',
    test: 'http://live-gql.test.gifshow.com', // TODO:原test服务，待修改
    production: 'http://graphql-server.internal' // TODO:原Production服务，待修改
};

export default <Config>{
    port: process.env.PORT || 8081, // 这块必须用这个不能写死5100 knode会动态分配端口
    defaultProxyServer: process.env.DEFAULT_PROXY_SERVER || defaultProxyHost[env], //  默认的请求转发接口，DEFAULT_PROXY_SERVER 可通过pm2.json传入

    // 项目根目录位置
    appPath: path.join(__dirname, '../server'),

    // 静态资源目录位置
    staticPath: path.join(__dirname, '../../dist')
};
