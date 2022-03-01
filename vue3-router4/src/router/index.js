import { createRouter, createWebHistory, createWebHashHistory } from '@/vue-router' // 这个就是引入的自己的
import Home from '../views/Home.vue'
import About from '../views/About.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    children:[
      {
        path:'a',
        component:{
          render:()=><h1>a页面</h1>
        },
     
      },
      {
        path:'b',
        component:{
          render:()=><h1>b页面</h1>
        }
      },
    ],
    // 路由钩子就是和路由同级
    beforeEnter: (to, from, next) => {
      console.log(to,'路由钩子,beforeEnter')
    }
  },
  {
    path: '/about',
    name: 'About',
    component: About,
  }
]

const router = createRouter({
  // history: createWebHashHistory(),
  history: createWebHistory(process.env.BASE_URL),
  routes
})
router.beforeEach((to,from,next)=>{
  console.log(to,'全局钩子,beforeEach,前置钩子');
})
router.beforeEach((to,from,next)=>{
  return new Promise((resolve,reject)=>{
    setTimeout(
       ()=>{
        console.log(to,'1全局钩子,beforeEach,前置钩子');
        resolve()
       },
       1000)
  })
 
})
router.beforeEach((to,from,next)=>{
  return new Promise((resolve,reject)=>{
    setTimeout(
       ()=>{
        console.log(to,'2全局钩子,beforeEach,前置钩子');
        resolve()
       },
       2000)
  })
})
router.beforeResolve((to,from,next)=>{
  return new Promise((resolve,reject)=>{
    setTimeout(
       ()=>{
        console.log(to,'全局钩子--解析,beforeResolve,前置钩子');
        resolve()
       },
       3000)
  })
})
router.afterEach((to,from,next)=>{
  console.log(to,'全局钩子,afterEach,后置钩子');
})
export default router
