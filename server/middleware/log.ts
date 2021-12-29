/**
 * @file log.ts
 * @desc 声明log日志中间件
 */
import logger from '../lib/logger';
import { Context } from 'koa';

export default async function logMiddleware(context: Context, next: () => void) {
    context.logger = logger;
    await next();
}
