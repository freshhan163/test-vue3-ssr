<template>
    <div class="page">
        <router-link to="/list/1" class="page-item">1</router-link>
        <router-link to="/list/2" class="page-item">2</router-link>
    </div>
    <div class="list">
        <div v-for="item in list"
            :key="item.id"
            class="list-item"
        >
            <div class="item-score">{{ item.points }}</div>
            <div class="item-content">
                <p class="title">{{ item.title }}</p>
                <p class="sub-text">
                    <span class="sub-text-item">用户：{{ item.user }}</span>
                    <span class="sub-text-item">发表时间{{ item.time }}</span>
                </p>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";

export default {
    name: "List",
    setup() {
        const store = useStore();
        const route = useRoute();
        const fetchList = (id = '1') => store.dispatch("FETCH_LIST", { page: parseInt(id, 10) });
        watch(() => route.params.id, newPage => {
            // @ts-ignore
            fetchList(newPage);
        });

        // @ts-ignore
        onMounted(() => fetchList(route.params.id));

        // @ts-ignore
        const list = computed(() => store.state.list[route.params.id]);
        const pageTitle = ref('列表页 /list');

        return {
            pageTitle,
            list,
            fetchList
        };
    },
    serverPrefetch(ctx) {
        if (!ctx) {
            return;
        }
        const { store, route } = ctx;
        if (!route.params) {
            return;
        }
        const { id } = route.params;
        return store.dispatch("FETCH_LIST", { page: parseInt(id, 10) });
    }
};
</script>
<style lang="scss">
.list-item {
    background-color: #fff;
    padding: 20px 30px 20px 80px;
    border-bottom: 1px solid #eee;
    position: relative;
    line-height: 20px;

    .item-score {
        color:#3eaf7c;
        font-size: 1.1em;
        font-weight: 700;
        position: absolute;
        top: 50%;
        left: 0;
        width: 80px;
        text-align: center;
        margin-top: -10px;
    }
    .title {
        color: #2e495e;
    }
    .sub-text {
        color: #595959;
        font-size: 0.85em;
        span {
            margin-right: 10px;
        }
    }
}
.page {
    padding: 15px 30px;
    text-align: center;
    box-shadow: 0 1px 2px rgb(0 0 0 / 10%);

    .page-item {
        color: #3eaf7c;
        background: #fff;
        border: 1px solid #3eaf7c;
        text-decoration: none;
        padding: 10px 20px;
        margin-right: 20px;
    }

    .router-link-active {
        color: #fff;
        background: #3eaf7c;
    }
}
</style>