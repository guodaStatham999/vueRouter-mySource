<template>
  <div class="home">
    首页

    <hr>
    <router-link to="/a">a页面</router-link>
    <router-link to="/b">b页面</router-link>
    <hr>


    <router-view></router-view>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from "@/components/HelloWorld.vue";

export default {
  name: "Home",
  components: {
    HelloWorld,
  },
  mounted() {
    // console.log(333);
    // console.log(this.$router)
    // console.log(this.$route)
  },
  beforeRouteEnter(to,from,next){
    console.log(to,'beforeRouteEnter,组件钩子进入')
  },
  beforeRouteUpdate(to,from,next){
    console.log(to,'beforeRouteUpdate,组件钩子更新')
  },
  beforeRouteLeave(to,from,next){ 
    // 路由切换的流程
    // a => b
    // 1. a的离开 \
    // 2. b的beforeEach 
    // 3. b的beforeEnter 
    // 4. b的beforeRouteEnter
    // 5. b的beforeResolve
    // 6. b的afterEach

    // a=> a
    // Beforeupdate
    console.log(to,'beforeRouteLeaved,组件钩子离开')
  },
};
</script>
