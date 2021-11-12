/**
 * @file api.js
 * @desc 工具函数
 */
import {
    computed
} from 'vue';

/**
 * 
 * @param {*} url string
 * @returns string
 * @description 返回url的 host
 */
export const toHost = (url) => {
    return computed(() => {
        const host = url.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
        const parts = host.split('.').slice(-3); // 只取最后三位
        if (parts[0] === 'www') parts.shift();

        return parts.join('.');
    });
}