/**
 * Created by yangw on 2016/11/16.
 * 课程直播间
 */

/* 页面准备好后触发 */
$(function () {

    // 初始化socket连接
    broadcastAction.socketInit();
    // 初始化页面事件
    broadcastAction.pageEventBind();
    // 绑定消息观察者事件
    broadcastAction.watcherInit(broadcastAction.message.send);
    broadcastAction.watcherInit(broadcastAction.message.received);
    // 注入激活观察者函数
    broadcastAction.watcherActive();
});

/**
 * 页面变量
 * message -- 页面消息对象,
 * 包含收到的消息(received)和即将发送(send)的消息.
 * value -- 接收/发送的消息对象, watcherList -- 存储所有观察者
 * listen -- 注入新的观察者, trigger -- 触发所有观察者
 * socket -- 页面初始化时连接到服务器的socket对象
 *
 * */

var broadcastAction = {

    socket: {},

    message: {
        send: {
            value: {},
            watcherList: [],
            listen: function () {},
            trigger: function () {}
        },
        received: {
            value: {},
            watcherList: [],
            listen: function () {},
            trigger: function () {}
        }
    }
};

/* 初始化函数 */
broadcastAction.socketInit = function () {

    // 弹出窗口
    var userName  = prompt('请输入昵称');
    $('#name').text(userName);

    // 连接到服务器,绑定观察者对象
    broadcastAction.socket = io();
    // 监听事件
    // 所有消息类型是可以自定义的
    broadcastAction.socket.on('connect', function () {
        var name = $('#name').text() || '匿名';
        broadcastAction.socket.emit('join', name);
    });

    // 系统消息
    broadcastAction.socket.on('systemMessage', function (msg) {

        broadcastAction.message.received.value = {
            message: msg,
            from: 'system'
        };
        broadcastAction.message.received.trigger('systemMessage', {
            message: msg,
            from: 'system'
        });

    });
    
    // 用户聊天消息
    broadcastAction.socket.on('newMessage', function (msg, user) {

        broadcastAction.message.received.value = {
            message: msg,
            from: user
        };
        broadcastAction.message.received.trigger('newMessage', {
            message: msg,
            from: user
        });

    });

};

/* 页面事件绑定 */
broadcastAction.pageEventBind = function () {

    // 用户发送消息
    $('#messageSend').click(function () {
        broadcastAction.message.send.trigger('send');
    });

    // messageInput键盘事件绑定
    $('#messageInput').on('keydown', function (e) {

        // 事件代码Enter
        if(e.which == 13){
            broadcastAction.message.send.trigger('send');
        }
    });
    
};

/* 观察者模式声明 */
broadcastAction.watcherInit = function (obj) {

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
        // 定义消息信息
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
};

/* 观察者模式注入 */
broadcastAction.watcherActive = function () {

    //--- 发送消息 ---//

    // 发送消息
    broadcastAction.message.send.listen('send', send);

    // 向服务器发送消息函数,事件类型定义为send
    function send() {
        // 发送检测
        var message = $('#messageInput').val().trim();
        // 更新数据依赖
        broadcastAction.message.send.value = message;
        if(!message){
            return broadcastAction.modalWindow('请输入要发送的消息!');
        }
        // 置空消息
        // $('#messageInput').val('');
        // 发送
        broadcastAction.socket.send(message);
    }

    //--- 接收消息 ---//

    // 接收系统消息
    broadcastAction.message.received.listen('systemMessage', receiveSystemMsg);
    // 接收用户消息
    broadcastAction.message.received.listen('newMessage', receiveNewMsg);

    // 接收系统消息
    function receiveSystemMsg(info) {

        // 消息发送者和消息内容和消息类型
        var system = "SYSTEM => ";
        var msg = info.args.message;
        var type = info.type;

        // 添加DOM
        var $messageList = $('.message-list');
        var $messageItem =
            $('<div class="message-list-item message-list-item-system">');

        $messageItem.text(system + msg);
        $messageList.append($messageItem);

        // 滚到页面底部
        var div = document.getElementById('messageList');
        div.scrollTop = div.scrollHeight;
    }

    // 接收用户新消息
    function receiveNewMsg(info) {

        // 消息发送者和消息内容和消息类型
        var user = info.args.from;
        var msg = info.args.message;
        var type = info.type;

        // 添加DOM
        var $messageList = $('.message-list');
        var $messageItem =
            $('<div class="message-list-item message-list-item-user">');

        $messageItem.text(user + '说: ' + msg);
        $messageList.append($messageItem);
        // 滚到页面底部
        var div = document.getElementById('messageList');
        div.scrollTop = div.scrollHeight;
    }

};

/* 模态弹窗 */
broadcastAction.modalWindow = function(text) {

    $('.modal-body').text(text);
    $('#modalWindow').modal("show", {
        backdrop : true,
        keyboard : true
    });
};



































