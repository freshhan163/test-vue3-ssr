<template>
  <div class="view">
    <item-list-nav v-bind="$attrs" />
    <div class="news-list">
      <item-list v-bind="$attrs" />
    </div>
  </div>
</template>

<script>
import { computed, onMounted, watch, toRefs } from 'vue'
import ItemListNav from '@/components/ItemListNav.vue';
import ItemList from '@/components/ItemList.vue';

export default {
  inheritAttrs: false,
  components: { ItemListNav, ItemList },
  serverPrefetch(ctx) {
    
    if (!ctx) {
      return;
    }
    const {store, route} = ctx;
    if (!route.params) {
        return;
    }
    let { feed = 'news', page = 1} = route.params;
    page = Number(route.params.page) || 1;
    
    const pages = page > 1 ? [page, page + 1, page - 1] : [page, page + 1];
    const promisis = pages.map((page) => {
      return store.dispatch('FETCH_FEED', { feed: feed, page: page });
    });
    return Promise.all(promisis);
  }
};
</script>

<style lang="scss">
/* eslint-disable */
.news-list {
  background:green;
  border-radius: 2px;
}

.news-list {
  position: absolute;
  margin: 30px 0;
  width: 100%;
  transition: all 0.3s cubic-bezier(0.55, 0, 0.1, 1);

  ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }
}
</style>
