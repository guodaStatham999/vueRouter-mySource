// 
function normalizeRouteRecord(record) {
    return {
        path: record.path, // 用户的路径,这块使用了状态机 解析路径的分数,算出匹配的规则
        name: record.name,
        meta: record.meta || {},
        // parent:null, // 
        beforeEnter: record.beforeEnter,
        components: {
            default: record.component // 循环
        },
        children: record.children || []
    }
}

// 创建一个匹配记录
function createRouteRecordMatcher(record, parent) {
    // record中的path 做一些修改 正则的情况,这里不处理正则的处理了
    let matcher = {
        path: record.path,
        record, // record就是原始数据
        parent,
        children: []
    }

    if (parent) {
        parent.children.push(matcher)
    }

    return matcher
}



// 格式化一个树,作为一个匹配记录
function createRouterMatcher(routes) {
    // 整个数组都要遍历一遍,有孩子再继续遍历
    let matchers = []

    function addRoute(route, parent = null) {
        let normalizedRecord = normalizeRouteRecord(route) // 格式化为一个{}
        if (parent) { // 如果有父亲,他的路径不能单独使用a  b... 而是 /a  /b
            normalizedRecord.path = parent.path + normalizedRecord.path
        }
        let matcher = createRouteRecordMatcher(normalizedRecord, parent); // 记录的record就是自己
        if ('children' in normalizedRecord) { // 对象查找 某属性是否在对象里
            let children = normalizedRecord.children
            for (let i = 0; i < children.length; i++) {
                let chi = children[i];
                addRoute(chi, matcher)
                // addRoute(route)
            }
        }
        matchers.push(matcher)
    }
    routes.forEach(route => addRoute(route));


    function resolve(location) {
        // {path:/,matched:[HomeRecord]}
        // {path:/a,matched:[HomeRecord,Arecord]} /a的情况下因为有孩子? 所以可以匹配出来两个吗?
        // 根据对象location解析一个结果
        let matched = []; // 存储链上的record,每个record是原始记录
        let path = location.path;

        let matcher = matchers.find(m => m.path === path); // matchers是外层的单数组

        while (matcher) {
            matched.unshift(matcher.record); // matched是找他的父级,每次while循环找到以后,都像数组前面插入.就是他的父级
            matcher = matcher.parent // 继续找父级,并且给matcher从新赋值
        }

        return {
            path,
            matched // 这里是要找到他自己,然后在沿着parent(他爸爸)向上查找,最后把所有的都找出来
        }
    }
    return {
        addRoute, // 这个是常用的方法,动态添加路由. 这个就是上面的addRoute的方法,只需要告诉是哪个路径,就可以添加到里面去-----------面试经常问-----------
        // 路由权限,路由动态权限,都是用这个方法. 添加新的路由规则

        resolve, // 这个是解析路由
    }
}

export {
    normalizeRouteRecord,
    createRouteRecordMatcher,
    createRouterMatcher
}

