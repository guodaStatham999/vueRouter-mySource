import {
    createWebHashHistory
} from './history/hash'
import {
    createWebHistory
} from './history/html5'
import {
    ref,
    shallowRef,
    computed,
    reactive,
    unref
} from 'vue'
import {RouterLink} from './router-link'
import {RouterView} from './router-view'
import {
    createRouterMatcher
} from './matcher'

// 数据处理 options.routes是用户的配置  难以理解,不好维护,用的时候也不方便
// / => record{home}
// /a => record {A组件,parent: Home}
// /b => record {B组件,parent: Home}
// /about => record {About}

// 当用户访问/a的时候 ,就可以去上面表格里去对比,需要渲染某个组件 => 当某个组件还是有父亲的时候,需要还继续查找父,然后渲染父的父. 直到没有父,渲染最外层,一层一层向内渲染.




// 响应式数据-定义的变量
let START_LOCATION_NORMALIZED = { // 初始化路由系统中的默认参数
    //  params,query,meta,name都是有的参数,但是目前只是实现path和matched
    path: '/',
    // params:{ // 路径参数
    // },
    // query:{ // 查询参数  
    // },
    matched: [], // 当前路径匹配到的路径
    // meta,
    // name
}

function useCallback(){
    let handlers = [];
    function add(handler){
        handlers.push(handler)
    }
    return {
        add,
        list:()=>handlers
    }
}

function createRouter({
    history,
    routes
}) { // 有两个参数,一个history,一个routes
    let routerHistory = history;
    // let routerRoutes = routes; // 格式化路由的配置 => 需要拍平 /a => a组件 /b =>b组件
    let matcher = createRouterMatcher(routes) // 格式化一个树
    // console.log(matcher);
    // 后续改变这个数据的value,就可以更新视图
    let currentRoute = shallowRef(START_LOCATION_NORMALIZED); // shallow不会再次包裹里面的对象为proxy了

    // 解析这个路径 有可能是字符串,有可能是对象 to='/' to={path:/}
    function resolve(to){ // 使用的是外层的matcher里的resolve功能
        if(typeof to =='string'){ // 如果是字符串,就把他们统一成为一个对象,这样后面方便编程序
            return  matcher.resolve({path:to})
        }else{
            // 暂时写的都是字符串,不写对象的形式
            return  matcher.resolve(to) // 如果是对象,就不用包裹起来

        }
    }

    let ready;
    function markAsReady(){ // 标记是否是第一次渲染,渲染完成后,就不会继续触发了
        if(ready)return // 节流,只会初始化一次.
        ready = true
        routerHistory.listen((to)=>{ // 监听到路径变化(页面的前进后退点击事件)后,解析路径,判断路径,修改路径
            let targetLocation = resolve(to); // 解析要去的路径, 可以匹配出多个父级
            let from = currentRoute.value;
            finalizeNavigation(targetLocation,from,true) // 在切换前进后退,是替换模式,不是push模式
        })
    }
    function finalizeNavigation(to,from,replace){ // 来去,路由钩子
        // 第一次就调用replace,第二次就是push,但是后来发现bug,一直使用push无法返回 原因: 是前进/后退的时候使用replace模式,才能前进后退. push无法使用前进后退
        if(from === START_LOCATION_NORMALIZED|| replace){
            routerHistory.replace(to.path)
        }else{ // 第二次跳转要记录路径,使用push
            routerHistory.push(to.path)
        }
        currentRoute.value = to; // 更新最新的路径,因为已经跳转了,要修改本地记录 
        // console.log(currentRoute.value);



        // 如果是初始化,还需要注入一个listen 去监听currentRoute.value,这样数据在前进/后退变化后,可以重新渲染视图
        markAsReady()
    }

    function pushWithRedirect(to){
        // 通过路径to 去匹配到对应的记录,更新currentRoute里的值
        // 根据路径去做一个解析,解析出来路径
        let targetLocation = resolve(to); // 解析出来要去的地方
  
        let from = currentRoute.value; // 解析出来从哪里来
        // 根据是不是第一次,来决定是push还是replace. 因为第一次使用push还要去掉/的初始化路径
        finalizeNavigation(targetLocation,from)

        // 可以实现路由的钩子, 在条赚钱我们可以做路由的拦截
        
    }

    function push(to){
        return pushWithRedirect(to)
    }
    let beforeGuards = useCallback()
    let beforeResolveGuards = useCallback()
    let afterGuards = useCallback()

    console.log(beforeGuards.list());
    let router = {
        push,
        replace(){

        },
        beforeEach:beforeGuards.add, // 都是可以注册多个,所以是个发布订阅
        beforeResolve:beforeResolveGuards.add,
        afterEach:afterGuards.add,
        // 路由的核心是: 页面切换,重新渲染
        install(app) { // 传入一个app,


            // 兼容vue2的写法
            app.config.globalProperties.$router = router; // 放入的是本身let router = 
            Object.defineProperty(app.config.globalProperties,'$route',{
                enumerable:true,
                get:()=>unref(currentRoute) // 把ref里的值结构出来使用
                // get:()=>currentRoute.value // 常规写法
            })



            let reactiveRoute = {} // 这个就是$route?
            for (let key in START_LOCATION_NORMALIZED) {
                reactiveRoute[key] = computed(() => currentRoute.value[key]) // 计算属性必须基于一个响应式属性,所以只有上面shallowRef以后才能使用computed
            }

            // vue3的provide是可以把响应式数据提供到组件上,所有子组件只需要inject就可以使用
            app.provide('router',router)
            app.provide('route location',reactive(reactiveRoute)) // 名字叫啥都行,只要inject的时候名字对应就可以



            // 路由初始化挂载需要有router-link和router-view两个全局组件,所以在此处挂载
            app.component("RouterLink", RouterLink
            // { // 这些是原生使用方法
            //     setup: (props, {
            //         slots,
            //         attrs,
            //         emit,
            //         expose
            //     }) => () => < a > {
            //         slots.default && slots.default()
            //     } </a>
            // }
            )
            app.component("RouterView", 
            RouterView
            // {
            //     setup: (props, {
            //         slots,
            //         attrs,
            //         emit,
            //         expose
            //     }) => () => < div > </div>
            // }
            )

            if(currentRoute.value === START_LOCATION_NORMALIZED){
                // 如果是一样,代表是初始化
                // 默认第一次的时候,让他做一次跳转
                push(routerHistory.location) // 初始化通过路由系统进行一次跳转,发生匹配
            }


            // 后续还有逻辑

            // 前面是匹配规则,真正的匹配还是需要实现的
            // 解析路径 ,Router-link router-view 实现 2. 页面的钩子
        }
    }
    return router
}

export {
    createWebHashHistory,
    createWebHistory,
    createRouter
}