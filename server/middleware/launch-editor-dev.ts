/**
 * @file launch-editor-dev.ts
 * @desc 【开发环境】用于在chrome的开发者控制台中，从Vue devtools中，直接打开编辑器，找到对应文件
 * 使用之前：先让编辑器支持从命令行打开，试试在终端中，输入对应指令能否打开编辑器；
 * 若能打开：修改下方的 specifiedEditor 为对应指令；
 * 编辑器对应指令：（https://github.com/yyx990803/launch-editor#supported-editors）
 * 若无法打开，请百度一下：如何从终端打开对应编辑器
 * 如visual studio code编辑器，对应命令code；当在终端中输入code无法打开vscode时，请参照官网文档（https://code.visualstudio.com/docs/setup/mac#_launching-from-the-command-line）
 */

import url from 'url';
import path from 'path';
import launch from 'launch-editor';
import { Context } from 'koa';

const srcRoot = process.cwd();
const specifiedEditor = 'code';

export default (ctx: Context, next: () => void) => {
    if (ctx.path !== '/__open-in-editor') {
        return next();
    }

    const { file } = url.parse(ctx.url, true).query || { file: '' };
    if (!file) {
        ctx.status = 500;
        ctx.body = 'launch-editor-middleware: required query param "file" is missing.';
    } else {
        // @ts-ignore
        launch(path.resolve(srcRoot, file), specifiedEditor);
        ctx.status = 200;
    }
};
