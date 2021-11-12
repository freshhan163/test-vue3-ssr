<template>
  <div class="news-list-nav">
    <router-link v-if="page > 1" :to="`/${feed}/${page - 1}`">
      &lt; prev
    </router-link>
    <a v-else class="disabled">&lt; 上一页</a>
    <span>{{ page }}/{{ maxPage }}</span>
    <router-link v-if="hasMore" :to="`/${feed}/${page + 1}`">
      下一页 &gt;
    </router-link>
    <a v-else class="disabled">下一页 &gt;</a>
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  props: {
    feed: {
      type: String,
      required: true,
    },
    page: {
      type: Number,
      required: true,
    },
    maxPage: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const hasMore = computed(() => props.page < props.maxPage);
    return {
      hasMore
    }
  }
};

// export const hasMore = computed(() => props.page < props.maxPage);
</script>


<style lang="scss">
.news-list-nav, .news-list {
  background-color: #fff;
  border-radius: 2px;
}

.news-list-nav {
  position: fixed;
  top: 55px;
  z-index: 998;
  left: 0;
  right: 0;
  padding: 15px 30px;
  text-align: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);

  a {
    margin: 0 1em;
  }

  .disabled {
    opacity: 0.8;
  }
}
</style>