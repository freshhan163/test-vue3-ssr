<template>
  <!-- 客户端激活 -->
  <!-- <div id="app"> -->
    <div class="menu">
      <router-link to="/" class="nav">首页</router-link>
      <router-link to="/user" class="nav">用户页面</router-link>
      <router-link to="/list/1" class="nav">列表页</router-link>
    </div>
    <router-view></router-view>
  <!-- </div> -->
</template>

<script lang="ts">
export default {
  name: 'App',
  data() {
    return {};
  }
};
</script>

<style lang="scss">
a {
    color: #2e495e;
    text-decoration: none;
}

.menu {
  padding: 20px 100px;
  background: #3eaf7c;
}

.nav {
    color: #fff;
    line-height: 24px;
    transition: color .15s ease;
    display: inline-block;
    vertical-align: middle;
    font-weight: 300;
    letter-spacing: .075em;
    margin-right: 1.8em;
    border: 2px solid #fff;
    padding: 0 10px;

    &:hover {
        color: #fff;
    }

    &.router-link-active {
        color: #fff;
        font-weight: 600;
    }
}

</style>