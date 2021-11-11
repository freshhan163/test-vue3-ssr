<template>
    <img alt="Vue logo" src="./assets/logo.png" />
    <div v-for="item in list" :ref="setItemRef" :key="item.id">
        <h1>韩晓芳测试项目</h1>
        <HelloWorld msg="Hello Vue 3 + TypeScript + Vite" />
    </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeUpdate, onUpdated } from 'vue'
import HelloWorld from './components/HelloWorld.vue'

export default {
    name: 'App',
    data() {
        return {
            list: [
                {
                    msg: '测试111',
                    id: 1
                },
                {
                    msg: '测试222',
                    id: 2
                },
                {
                    msg: '测试333',
                    id: 3
                },
            ]
        };
    },
    components: {
        HelloWorld
    },
    setup() {
        let itemRefs: any[] = [];
        const setItemRef = (el: Element) => {
            if (el) {
                itemRefs.push(el);
            }
        };

        onBeforeUpdate(() => {
            itemRefs = [];
        });

        onUpdated(() => {
            console.log('itemRefs = ', itemRefs);
        });
        return {
            setItemRef
        }
    }
}
// export default defineComponent({
//     name: 'App',
//     data: function() {
//         return {
//             list: [
//                 {
//                     msg: '测试111',
//                     id: 1
//                 },
//                 {
//                     msg: '测试222',
//                     id: 2
//                 },
//                 {
//                     msg: '测试333',
//                     id: 3
//                 },
//             ],
//             itemRefs: [],
//         };
//     },
//     components: {
//         HelloWorld
//     },
//     beforeUpdate() {
//         this.itemRefs = [];
//     },
//     updated() {
//         console.log('this.refs = ', this.itemRefs);
//     },
//     methods: {
//         setItemRef(el: any) {
//             if (el) {
//                 this.itemRefs.push(el);
//             }
//         }
//     }
// })
</script>

<style>
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
}
</style>
