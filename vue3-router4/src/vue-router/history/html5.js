function buildState(back, current, forward, replace = false, computedScroll = false) {
    // back后退以后是哪个路径
    // current当前路径是哪个
    // forward要去哪个路径
    // replace默认使用push,所以replace是默认false => 用的push跳转还是replace跳转
    // computedScroll记录跳转的时候滚动条的位置在哪里,在返回的时候会有用处
    return {
        back,
        current,
        forward,
        replace,
        scroll: computedScroll ? {
            left: window.pageXOffset,
            top: window.pageXOffset
        } : null,
        position: window.history.length - 1 // 跳转多少层了,有个定位. 默认从2开始,所以减掉1
    }
}

function createCurrentLocation(base = '') {
    let {
        pathname,
        search,
        hash
    } = window.location;
   let hasPos = base.includes('#') // 有hash就是存在路径
   if(hasPos){ // 如果有hash
       return base.slice(1) || '/' // 如果有#,就把#裁剪掉. 但是发现bug缺少一个/
   }
    return pathname + search + hash
}

function useHistoryStateNavigation(base) {
    let currentLocation = { // 当前路径
        value: createCurrentLocation(base), // 可以currentLocation.value来获取值
    };
    let historyState = { // 状态
        value: window.history.state
    }
    if (!historyState
        .value) { // 首次刷新页面,没有任何状态. 我们就维护一个状态(后退以后是哪个路径,当前路径是哪个,要去哪个路径,是用的push跳转还是replace跳转,记录跳转的时候滚动条的位置在哪里)
        changeLocation(currentLocation.value, buildState(null, currentLocation.value, null,
            true), true) // 修改window.history里的数据
    }

    function changeLocation(to, state, replace) { // 去哪里,状态是什么,用什么模式用这个函数来修改
        let hasPos = base.includes('#')

        // 如果是hash版本,就要增加#
        let url = hasPos? base + to : to;
        window.history[replace ? 'replaceState' : 'pushState'](state, null, url)
        historyState.value = state // 每次修改url,就需要修改历史路径. 将自己生成的状态同步到路由系统中
    }

    function push(to, data) { // 1. 去哪里 2. 带的新状态是谁
        // 跳转的时候,做两个细化 
        //1. 跳转前 => 从哪里去哪里 感觉是便于路由守卫等的触发
        let currentState = Object.assign(
            {},
            historyState.value, // 当前的状态
            {
                forward: to,
                scroll: {
                    left: window.pageXOffset,
                    top: window.pageXOffset
                }
            }
        )
        // 本质没有跳转,只是更新状态(---吧historyState.value和window.history里的状态修改)   后续在vue中可以详细监控到状态的变化
        changeLocation(currentState.current, currentState, true)

        let state = Object.assign(
            {},
            buildState(currentLocation.value, to, null),
            {
                position: currentState.position + 1 // 因为准备修改定位,而这个值还是上次的,所以需要修改一下
            },
            data // 最新的状态
        )
        changeLocation(to, state, false) // 这才是更改了路径,前面的传参还是currentLocation,只是调用了里面的修改参数. 感觉拆开就是为了中间做一些生命周期的监控.
        currentLocation.value = to
        //2. 跳转后 => 从这到了那
    }
    // --replace和push的区别--  [a,b,c] 一个栈里的内容,如果是push,就向后追加. 一个栈里如果是replace就是把最后一个替换. 
    function replace(to, data) { // 1. 去哪里 2. 带什么新状态
        // data和自身historyState合并
        let state = Object.assign( // 合成了一个新状态
            {},
            buildState(historyState.value.back, to, historyState.value
                .forward, true), // 替换的话,就考虑所有的都用以前的值就行,没太懂为什么
            data // 用户传递的还是要继续传递进去
        )
        changeLocation(to, state, true)
        currentLocation.value = to // 替换后需要将路径变为现在的路径
    }
    return {
        location: currentLocation, // 当前位置
        state: historyState,
        push,
        replace
    }
}
// 前进后退的时候,要更新historyState,currentLocation这两个变量
function useHistoryStateListeners(base,historyState, currentLocation) { // 做个前进后退监听
    let listeners = []
    let popStateHandler = ({ state }) => { // 每次都能从上一次里取得上一次的状态 // e.state直接做了解构赋值
        // 只能监听浏览器的前进/后退功能 不用监听hashchange
        // console.log(state); // 每次触发都是最新的状态,所以下面的historyState才能直接使用. 是已经前进后退完成后的状态
        let to = createCurrentLocation(base); // 去哪里的值  监听到改变的时候,获取当前值就可以.
        let from = currentLocation.value; // 从哪里来的值 =>url
        let fromState = historyState.value; // 从哪里来的状态 => state是个对象
        currentLocation.value = to;
        historyState.value = state // state有可能为null
        // buildState(from,currentLocation,to)
        let isBack = (state.position - fromState.position) < 0// 当前的状态 - 上次的状态 如果小于0就是后退 否则前进
        listeners.forEach(listener => {
            listener(to, from, { isBack })
        })
    }
    window.addEventListener('popstate', popStateHandler)
    function listen(cb) {
        listeners.push(cb)
    }
    return {
        listen
    }

}
export function createWebHistory( base = '') {
    // 1. 包含当前路径(url) 2. 当前路径他的状态是什么(state) 3. 需要提供两个切换路径的方法(push/replace)
    let historyNavigation = useHistoryStateNavigation(base); // 包含路径,状态,两个包含的方法
    let historyListeners = useHistoryStateListeners(base,historyNavigation.state, historyNavigation.location) // 这里是做了个监听
    let routerHistory = Object.assign(
        {},
        historyNavigation,
        historyListeners
    )
    Object.defineProperty(routerHistory, 'location', { // 原本外界取值是routerHistory.location.value,现在就是routerHistory.location
        get: () => historyNavigation.location.value
    })
    Object.defineProperty(routerHistory, 'state', { // 原本外界取值是routerHistory.location.value,现在就是routerHistory.location
        get: () => historyNavigation.state.value
    })
    return routerHistory

    // routerHistory.location 代表当前路径
    // routerHistory.state 代表当前的状态
    // listen是个方法 是监听了前进后退的事件
    // push&replace 是切换路径和状态 : push是栈中向最后一项后追加 replace是最后一项被替换
}

