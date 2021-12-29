/*
 * @file logger.ts
 * @desc: log4js初始化
 */
import { configure, getLogger } from "log4js";

configure({
    appenders: { 'out': {
        type: 'stdout',
        layout: {
            type: 'coloured'
        }
    } },
    categories: { default: { appenders: ['out'], level: 'info' } }
});

const logger = getLogger();
logger.level = "info";

export default logger;
