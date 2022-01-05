import { createStore } from 'vuex';
import axios from 'axios';

const $axios = axios.create({
    baseURL: 'https://api.hackerwebapp.com'
});

const store = createStore({
    state: {
        list: {}
    },
    mutations: {
        SET_LIST: (state, { page, data  }) => {
            state.list[page] = data || [];
        }
    },
    actions: {
        async FETCH_LIST({ commit }, { page }) {
            const { data } = await $axios.get(`/news?page=${page}`);
            commit('SET_LIST', { page, data });
        }
    }
});

export function _createStore() {
    return store;
}
