import fs from 'fs';
import path from 'path';
import _ from 'lodash';

interface ContentAttrs {
    META_ATTRS: string; // meta信息
    TITLE_NAME: string; // title名称
    HEAD_RESOURCE_ATTRS: string; // 资源信息
    APP_ATTRS: string; // body信息
    BODY_RESOURCE_ATTRS: string; // body下方的资源
    STATE_ATTRS: string; // state内容
}
export const renderHtml = function(content: ContentAttrs) {
    const fileTemplate = fs.readFileSync(path.resolve(__dirname, './template.html'), 'utf-8');
    _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

    const defaultContent = {
        META_ATTRS: '',
        TITLE_NAME: '服务端渲染',
        HEAD_RESOURCE_ATTRS: '',
        APP_ATTRS: '',
        BODY_RESOURCE_ATTRS: '',
        STATE_ATTRS: ''
    };
    
    return _.template(fileTemplate)(Object.assign(defaultContent, content));
};
