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
        }
      },
      {
        path:'b',
        component:{
          render:()=><h1>b页面</h1>
        }
      },
    ]
  },
  {
    path: '/about',
    name: 'About',
    component: About
  }
]

const router = createRouter({
  // history: createWebHashHistory(),
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
