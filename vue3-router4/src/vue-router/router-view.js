import {h,inject,provide,computed} from 'vue'


export let RouterView = {
    name:'RouterView', // 因为是个组件,所以必须要有名字
    props:{
        name:{
            // 正常是有的,本次不考虑
        }
    },
    setup(props,{slots}){
        // -------这块整体逻辑是
        let depth = inject('depth',0) // inject如果取不到这个值,这个值就是0
        let injectRoute = inject('route location') // inject只能在setup里使用
        console.log(injectRoute);
        let matchedRouteRef =  computed(()=>injectRoute.matched[depth]) // 不用computed的话,后面用就是个固定值了,失去响应性
        provide('depth',depth + 1); // 在儿子层渲染的时候,就会知道刚才是第一层
        return ()=>{ // 这个是渲染节点
            // injectRoute在setup里使用,每次都是最新值
            // matched => [home,a] 多个组件s
            console.log(injectRoute.matched);
            let matchRoute = matchedRouteRef.value; // 这个是ref,是动值
            let viewComponent =matchRoute&&matchRoute.components.default
            if(!viewComponent){ // 如果没有这个值
                return slots.default && slots.default()
            }
            return h(viewComponent) 
        }
    }
}