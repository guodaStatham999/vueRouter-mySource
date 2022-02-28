import {h,inject} from 'vue'

function useLink(props){
    let router =  inject('router') // --- 有个报错,说是必须放在setup里,原本在navigate里的.放到外面就可以了..不太懂  inject() can only be used inside setup() or functional components.
    function navigate(){ // 这里要出发路由的跳转
        // 如何出发路由的跳转? => index.js下有app.provider已经提供了,这里是直接用了注入
        // console.log('点击');
       router.push(props.to)
    }
    return {
        navigate
    }
}
export let RouterLink = {
    name:'RouterLink', // 因为是个组件,所以必须要有名字
    props:{
        to:{
            type:[String,Object],
            qreuire:true
        }
    },
    setup(props,{slots}){
        let link = useLink(props)
        return ()=>{ // 这个是渲染节点
            return h('a',{
                onClick:link.navigate
            },slots.default&&slots.default()) // router-link就是一个a标签
        }
    }
}