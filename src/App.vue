<template>
    <header class="header">
        <nav class="inner" role="navigation">
            <router-link to="/" class="logo" exact>
                <span>首页</span>
            </router-link>
            <a
                class="github"
                href="https://github.com/vuejs/vue-next"
                target="_blank"
                rel="noopener banner"
            >
                vue-next库源码
            </a>
        </nav>
    </header>
    <router-view v-slot="{ Component, route }">
        <transition name="fade" mode="out-in">
            <component :is="Component" :key="route.params.feed" :test="1" />
        </transition>
    </router-view>
</template>

<script lang="ts">

export default {
    name: 'app',
    setup() {
        return {};
    }
};
</script>

<style lang="scss">
body {
    font-size: 15px;
    background-color: #f2f3f5;
    margin: 0;
    padding-top: 55px;
    color: #2e495e;
    overflow-y: scroll;
}

a {
    color: #2e495e;
    text-decoration: none;
}

.header {
    background-color: #3eaf7c;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 999;
    height: 55px;

    .inner {
        max-width: 800px;
        box-sizing: border-box;
        margin: 0 auto;
        padding: 15px 5px;
    }

    a {
        color: #fff;
        line-height: 24px;
        transition: color .15s ease;
        display: inline-block;
        vertical-align: middle;
        font-weight: 300;
        letter-spacing: .075em;
        margin-right: 1.8em;

        &:hover {
            color: #fff;
        }

        &.router-link-active {
            color: #fff;
            font-weight: 600;
        }
    }

    .github {
        color: #fff;
        font-size: .9em;
        margin: 0;
        float: right;
    }
}

.view {
    max-width: 800px;
    margin: 0 auto;
    position: relative;
}

.logo {
    position: relative;
    height: 24px;
    padding: 2px;
    margin-right: 10px;
    background-color: #fff;
    vertical-align: middle;

    span {
        padding: 2px 6px;
        font-weight: 600;
        width: 100%;
        text-align: center;
        color: #fff;
        background-color: #3eaf7c;
    }
}

.fade-enter-active,
.fade-leave-active {
    transition: all .2s ease;
}

.fade-enter,
.fade-leave-active {
    opacity: 0;
}

@media (max-width: 860px) {
    .header .inner {
        padding: 15px 30px;
    }
}

@media (max-width: 600px) {
    .header {
        .inner {
            padding: 15px;
        }

        a {
            margin-right: 1em;
        }

        .github {
            display: none;
        }
    }
}
</style>
