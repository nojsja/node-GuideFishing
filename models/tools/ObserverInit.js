/**
 * Created by yangw on 2016/11/25.
 * 对象初始化观察者方法
 */

function ObserverInit(obj) {

    // 观察者触发函数数组
    obj.watcherList = {};

    // 添加观察者, 各个观察者对应相应的类型
    obj.listen = function (type, fn) {
        // 本观察类型不存在
        if(!this.watcherList[type]){
            this.watcherList[type] = [fn];
        }else {
            this.watcherList[type].push(fn);
        }

        return this;
    };

    // 触发观察者
    obj.trigger = function (type, args) {

        // 如果没有此观察类型,则返回
        if(!this.watcherList[type]){
            return;
        }
        // 包裹定义消息信息
        // 观察者触发事件类型
        var events = {
            type: type,
            args: args || {}
        };
        for(var index in this.watcherList[type]){
            // 绑定作用域,遍历触发函数
            this.watcherList[type][index].call(this, events);
        }
    };

    // 移除观察者
    obj.remove = function (type, fn) {

        // 判断是否是数组
        if(this.watcherList[type] instanceof Array){
            var i = this.watcherList[type].length - 1;
            for(i; i >= 0; i--){
                if(this.watcherList[type][i] === fn ){
                    // 数组删除指定索引的元素
                    this.watcherList[type].splice(i, 1);
                }
            }
        }
    };
}

module.exports = ObserverInit;