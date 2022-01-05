<template>
  <div>当前页面是: {{ user }}</div>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      user: '首页'
    };
  }
};
</script>
