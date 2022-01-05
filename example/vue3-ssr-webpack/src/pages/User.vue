<template>
  <div class="user">当前页面是: {{ pageTitle }}</div>
</template>

<script>
export default {
    name: "UserPage",
    setup() {
        const pageTitle = '用户页面 /user';
        return {
            pageTitle
        };
    }
};
</script>
<style lang="scss">
.user {
    font-size: 30px;
    text-align: center;
}
</style>