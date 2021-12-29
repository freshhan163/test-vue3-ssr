/**
 * @file api.ts
 * @desc 数据mock
 */
import {
    useStore
} from 'vuex';
import axios, { AxiosResponse } from 'axios';

const isArray = Array.isArray;
const $axios = axios.create({
    baseURL: 'https://api.hackerwebapp.com'
});

const responseHandler = ((response: AxiosResponse<Response>) => {
    return new Promise((resolve, reject) => {
        if (response) {
            resolve(response);
        } else {
            reject(response);
        }
    }).then(null, err => {
        throw new Error(err);
    });
});

const responseErrorHandler = ((error: any) => {
    return new Promise((resolve, reject) => {
        reject({
            status: error.response ? error.response.status : error.code,
            error_detail: error.stack || ''
        });
    }).catch(err => {
        return {
            status: err.status || 500,
            data: null
        };
    });
});

$axios.interceptors.response.use(responseHandler, responseErrorHandler);

export const api = {
    async getFeeds(feed, page, commit, optimistic) {
        commit(optimistic)
        const {
            data
        } = await $axios.get(`/${feed}?page=${page}`)
        commit(data)
    },

    async getUser(id, commit, optimistic) {
        commit(optimistic)
        const {
            data
        } = await $axios.get(`/user/${id}`);
        commit(data)
    },

    async getItem(id, commit, optimistic) {
        commit(optimistic)
        const {
            data
        } = await $axios.get(`/item/${ id }`);
        commit(Object.assign({}, optimistic, data, {loading: false}));
    }
}

export function fetchItems(feed, page, isServer = false) {
    const store = useStore()
    let f = feed
    let p = page
    let pages = []

    // watcher
    if (isArray(feed) && isArray(page)) {
        const [f, p] = feed;
        const [fOld, pOld] = page;

        pages = f !== fOld ? [p, p + 1] : p > pOld ? [p + 1] : [p - 1]
        // serverPrefetch, mounted：服务端预取
    } else {
        if (isServer) {
            pages = [p]
        } else {
            pages = p > 1 ? [p, p + 1, p - 1] : [p, p + 1]
        }
    }
    pages.forEach((p) => store.dispatch('FETCH_FEED', {
        f,
        p
    }))
}