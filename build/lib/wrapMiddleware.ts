/**
 * @file wrapMiddleware
 * @desc 将webpack-dev-middleware处理为koa可用的中间件，直接用koa-connect会导致入口文件的css没用加载
 */

export default function wrapMiddleware(compiler, devMiddleware) {
    return (context, next) => {
        // wait for webpack-dev-middleware to signal that the build is ready
        const ready = new Promise((resolve, reject) => {
            for (const comp of [].concat(compiler.compilers || compiler)) {
                comp.hooks.failed.tap('KoaWebpack', (error) => {
                    reject(error);
                });
            }

            devMiddleware.waitUntilValid(() => {
                resolve(true);
            });
        });
        // tell webpack-dev-middleware to handle the request
        const init = new Promise<void>((resolve) => {
            devMiddleware(
                context.req,
                {
                    end: (content) => {
                        // eslint-disable-next-line no-param-reassign
                        context.body = content;
                        resolve();
                    },
                    getHeader: context.get.bind(context),
                    setHeader: context.set.bind(context),
                    locals: context.state
                },
                () => resolve(next())
            );
        });

        return Promise.all([ready, init]);
    };
}