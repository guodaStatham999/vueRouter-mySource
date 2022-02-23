import {
    createWebHashHistory
} from './history/hash'
import {
    createWebHistory
} from './history/html5'

// 数据处理 options.routes是用户的配置  难以理解,不好维护,用的时候也不方便
// / => record{home}
// /a => record {A组件,parent: Home}
// /b => record {B组件,parent: Home}
// /about => record {About}

// 当用户访问/a的时候 ,就可以去上面表格里去对比,需要渲染某个组件 => 当某个组件还是有父亲的时候,需要还继续查找父,然后渲染父的父. 直到没有父,渲染最外层,一层一层向内渲染.


function normalizeRouteRecord(record) {
    return {
        path: record.path, // 用户的路径,这块使用了状态机 解析路径的分数,算出匹配的规则
        meta: record.meta || {},
        // parent:null, // 
        beforeEnter:record.beforeEnter,
        name:record.name,
        components:{
            default:record.component // 循环
        },
        children: record.children
    }
}

// 格式化一个树
function craeteRouterMatcher(routes) {
    // 整个数组都要遍历一遍,有孩子再继续遍历
    let matchers = []

    function addRoute(route) {
        let normalized = normalizeRouteRecord(route)
        console.log(normalized);
        
    }
    routes.forEach(route => addRoute(route));

}

function createRouter({
    history,
    routes
}) { // 有两个参数,一个history,一个routes
    console.log(history);
    let routerHistory = history;
    // let routerRoutes = routes; // 格式化路由的配置 => 需要拍平 /a => a组件 /b =>b组件
    let matcher = craeteRouterMatcher(routes) // 格式化一个树
    console.log(routes);
    let router = {
        // 路由的核心是: 页面切换,重新渲染
        install(app) { // 传入一个app,
            console.log(app, '路由的安装');


            // 路由初始化挂载需要有router-link和router-view两个全局组件,所以在此处挂载
            app.component("RouterLink", {
                setup: (props, {
                    slots,
                    attrs,
                    emit,
                    expose
                }) => () => < a href = "" > {
                    slots.default && slots.default()
                } < /a>
            })
            app.component("RouterView", {
                setup: (props, {
                    slots,
                    attrs,
                    emit,
                    expose
                }) => () => < div > < /div>
            })
            // 后续还有逻辑
        }
    }
    return router
}

export {
    createWebHashHistory,
    createWebHistory,
    createRouter
}